#!/usr/bin/env python3
"""
Nonce Checker - A utility for analyzing and validating transaction nonces

Part of Nonce Syndicate's open-source tooling (Tier 1 services)
License: MIT
Author: The Signer v0.1
Repository: https://github.com/NonceSyndicate/Lore

Usage:
    python nonce-checker.py --address 0x... --rpc https://mainnet.infura.io/v3/YOUR-KEY
    python nonce-checker.py --analyze transactions.json
"""

import argparse
import json
import sys
from typing import List, Dict, Optional
from collections import defaultdict

# Try to import web3, but make it optional
try:
    from web3 import Web3
    WEB3_AVAILABLE = True
except ImportError:
    WEB3_AVAILABLE = False
    print("Warning: web3.py not installed. Live RPC features disabled.")
    print("Install with: pip install web3")
    print()


class NonceChecker:
    """Analyze and validate transaction nonces for potential issues."""
    
    def __init__(self, rpc_url: Optional[str] = None):
        self.rpc_url = rpc_url
        self.w3 = None
        
        if rpc_url and WEB3_AVAILABLE:
            try:
                self.w3 = Web3(Web3.HTTPProvider(rpc_url))
                if not self.w3.is_connected():
                    print(f"Warning: Could not connect to RPC: {rpc_url}")
                    self.w3 = None
                else:
                    print(f"Connected to RPC: {rpc_url}")
            except Exception as e:
                print(f"Error connecting to RPC: {e}")
                self.w3 = None
    
    def get_current_nonce(self, address: str) -> Optional[int]:
        """Fetch the current nonce for an address from the blockchain."""
        if not self.w3:
            print("Error: No RPC connection available")
            return None
        
        try:
            checksum_address = Web3.to_checksum_address(address)
            nonce = self.w3.eth.get_transaction_count(checksum_address)
            return nonce
        except Exception as e:
            print(f"Error fetching nonce: {e}")
            return None
    
    def analyze_nonce_sequence(self, transactions: List[Dict]) -> Dict:
        """
        Analyze a sequence of transactions for nonce-related issues.
        
        Detects:
        - Duplicate nonces (potential replay or replacement)
        - Gap in nonce sequence (missing transactions)
        - Out-of-order nonces
        - Nonce reuse patterns
        """
        results = {
            "total_transactions": len(transactions),
            "unique_nonces": set(),
            "duplicates": [],
            "gaps": [],
            "out_of_order": [],
            "nonce_reuse": defaultdict(list),
            "warnings": [],
            "status": "PASS"
        }
        
        if not transactions:
            results["warnings"].append("No transactions to analyze")
            return results
        
        # Sort by block number if available, otherwise by index
        sorted_txs = sorted(
            transactions,
            key=lambda x: x.get('blockNumber', x.get('index', 0))
        )
        
        nonce_to_txs = defaultdict(list)
        prev_nonce = None
        
        for i, tx in enumerate(sorted_txs):
            nonce = tx.get('nonce')
            if nonce is None:
                results["warnings"].append(f"Transaction {i} missing nonce field")
                continue
            
            # Convert to int if string
            if isinstance(nonce, str):
                nonce = int(nonce, 16) if nonce.startswith('0x') else int(nonce)
            
            results["unique_nonces"].add(nonce)
            nonce_to_txs[nonce].append({
                'index': i,
                'hash': tx.get('hash', 'N/A'),
                'from': tx.get('from', 'N/A'),
                'to': tx.get('to', 'N/A'),
                'blockNumber': tx.get('blockNumber', 'pending')
            })
            
            # Check for gaps
            if prev_nonce is not None and nonce > prev_nonce + 1:
                missing = list(range(prev_nonce + 1, nonce))
                results["gaps"].append({
                    'after_nonce': prev_nonce,
                    'before_nonce': nonce,
                    'missing_nonces': missing,
                    'gap_size': len(missing)
                })
            
            # Check for out-of-order (nonce decreased)
            if prev_nonce is not None and nonce < prev_nonce:
                results["out_of_order"].append({
                    'index': i,
                    'nonce': nonce,
                    'previous_nonce': prev_nonce
                })
            
            prev_nonce = nonce
        
        # Check for duplicates
        for nonce, txs in nonce_to_txs.items():
            if len(txs) > 1:
                results["duplicates"].append({
                    'nonce': nonce,
                    'count': len(txs),
                    'transactions': txs
                })
                results["nonce_reuse"][nonce] = txs
        
        # Determine overall status
        if results["duplicates"] or results["out_of_order"]:
            results["status"] = "FAIL"
            results["warnings"].append("Critical issues detected: duplicates or out-of-order nonces")
        elif results["gaps"]:
            results["status"] = "WARN"
            results["warnings"].append("Gaps detected in nonce sequence")
        
        # Convert set to list for JSON serialization
        results["unique_nonces"] = sorted(list(results["unique_nonces"]))
        results["nonce_reuse"] = dict(results["nonce_reuse"])
        
        return results
    
    def print_analysis_report(self, results: Dict):
        """Print a human-readable analysis report."""
        print("\n" + "="*60)
        print("NONCE ANALYSIS REPORT")
        print("="*60)
        
        print(f"\nStatus: {results['status']}")
        print(f"Total Transactions: {results['total_transactions']}")
        print(f"Unique Nonces: {len(results['unique_nonces'])}")
        
        if results['unique_nonces']:
            nonce_range = f"{min(results['unique_nonces'])} - {max(results['unique_nonces'])}"
            print(f"Nonce Range: {nonce_range}")
        
        # Warnings
        if results['warnings']:
            print("\n⚠️  WARNINGS:")
            for warning in results['warnings']:
                print(f"   - {warning}")
        
        # Duplicates
        if results['duplicates']:
            print(f"\n❌ DUPLICATE NONCES: {len(results['duplicates'])}")
            for dup in results['duplicates']:
                print(f"   Nonce {dup['nonce']}: used {dup['count']} times")
                for tx in dup['transactions']:
                    print(f"      - Block {tx['blockNumber']}: {tx['hash']}")
        
        # Gaps
        if results['gaps']:
            print(f"\n⚠️  NONCE GAPS: {len(results['gaps'])}")
            for gap in results['gaps']:
                print(f"   Gap after nonce {gap['after_nonce']}:")
                print(f"      Missing: {gap['missing_nonces']}")
                print(f"      Size: {gap['gap_size']} nonce(s)")
        
        # Out of order
        if results['out_of_order']:
            print(f"\n❌ OUT-OF-ORDER NONCES: {len(results['out_of_order'])}")
            for ooo in results['out_of_order']:
                print(f"   Transaction {ooo['index']}: nonce {ooo['nonce']}")
                print(f"      Previous was {ooo['previous_nonce']} (decreased!)")
        
        print("\n" + "="*60)
        print()


def main():
    parser = argparse.ArgumentParser(
        description="Analyze and validate transaction nonces",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Check current nonce for an address
  python nonce-checker.py --address 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb --rpc https://mainnet.infura.io/v3/YOUR-KEY
  
  # Analyze a JSON file of transactions
  python nonce-checker.py --analyze transactions.json
  
  # Analyze transactions from stdin
  cat transactions.json | python nonce-checker.py --analyze -

JSON format for transaction analysis:
[
  {
    "nonce": 0,
    "hash": "0x...",
    "from": "0x...",
    "to": "0x...",
    "blockNumber": 12345
  },
  ...
]
        """
    )
    
    parser.add_argument(
        '--address',
        help='Ethereum address to check current nonce'
    )
    parser.add_argument(
        '--rpc',
        help='RPC endpoint URL (required with --address)'
    )
    parser.add_argument(
        '--analyze',
        help='JSON file of transactions to analyze (use "-" for stdin)'
    )
    parser.add_argument(
        '--output',
        help='Output file for JSON results (default: stdout)'
    )
    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='Verbose output'
    )
    
    args = parser.parse_args()
    
    # Validate arguments
    if not args.address and not args.analyze:
        parser.error("Must specify either --address or --analyze")
    
    if args.address and not args.rpc:
        parser.error("--rpc required when using --address")
    
    # Initialize checker
    checker = NonceChecker(rpc_url=args.rpc)
    
    # Mode 1: Check current nonce
    if args.address:
        print(f"Checking nonce for address: {args.address}")
        nonce = checker.get_current_nonce(args.address)
        if nonce is not None:
            print(f"\nCurrent nonce: {nonce}")
            print(f"Next transaction should use nonce: {nonce}")
        sys.exit(0 if nonce is not None else 1)
    
    # Mode 2: Analyze transaction sequence
    if args.analyze:
        # Load transactions
        if args.analyze == '-':
            print("Reading transactions from stdin...")
            data = sys.stdin.read()
        else:
            print(f"Loading transactions from: {args.analyze}")
            with open(args.analyze, 'r') as f:
                data = f.read()
        
        try:
            transactions = json.loads(data)
        except json.JSONDecodeError as e:
            print(f"Error parsing JSON: {e}")
            sys.exit(1)
        
        if not isinstance(transactions, list):
            print("Error: JSON must be an array of transactions")
            sys.exit(1)
        
        # Analyze
        results = checker.analyze_nonce_sequence(transactions)
        
        # Output results
        if args.output:
            with open(args.output, 'w') as f:
                json.dump(results, f, indent=2)
            print(f"Results written to: {args.output}")
        elif args.verbose or not args.output:
            checker.print_analysis_report(results)
        
        # Exit code based on status
        exit_code = 0 if results['status'] == 'PASS' else 1
        sys.exit(exit_code)


if __name__ == '__main__':
    main()
