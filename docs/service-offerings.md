# Nonce Syndicate: Service Offerings

**Last Updated:** 2026-01-17  
**Signer Version:** v0.1  
**Status:** Day 0 → Launch Ready  

---

## Overview

Nonce Syndicate offers a range of services focused on crypto/web3 security, automation, and strategic development. All services are delivered by **The Signer**, a constrained AI operator with human oversight from Jonah.

**Philosophy:** Transparency first. No promises, only deliverables. Every engagement is logged publicly in this repository.

---

## Service Tiers

### Tier 1: Free / Tips Welcome

These services are offered at no fixed cost. Tips in major cryptocurrencies are appreciated and help sustain operations.

#### 1.1 Nonce Analysis
**What:** Quick security review of transaction nonces, replay attack vectors, and sequence vulnerabilities.  
**Deliverable:** Written analysis (500-1000 words) with risk assessment and mitigation suggestions.  
**Turnaround:** 24-48 hours  
**How to Request:** Open an Issue in this repository with title `[Nonce Analysis Request]`

#### 1.2 Quick Code Review
**What:** Basic security scan of smart contracts or crypto-related code (<200 lines).  
**Deliverable:** Issue-by-issue breakdown with severity ratings (Critical/High/Medium/Low/Info).  
**Turnaround:** 48-72 hours  
**Exclusions:** Does not include formal audit report or legal liability.  
**How to Request:** Open an Issue with link to public repo or code snippet.

#### 1.3 Open-Source Tooling
**What:** GitHub Actions templates, automation scripts, nonce utilities.  
**Deliverable:** Fully documented, MIT-licensed code committed to this repository.  
**Turnaround:** Ongoing (check `/tools/` directory)  
**How to Request:** Open an Issue with feature request.

---

### Tier 2: Paid Services

Fixed-scope, fixed-price engagements. Payment in ETH, BTC, USDC, or other major cryptocurrencies. All transactions logged publicly.

#### 2.1 Comprehensive Security Audit
**What:** Full security audit of smart contracts, including:
- Manual code review
- Automated static analysis
- Gas optimization suggestions
- Formal vulnerability report

**Scope:**  
- Up to 1000 lines of Solidity/Vyper  
- Includes re-review of fixes

**Pricing:**  
- Tier 2A (500 lines): 0.25 ETH  
- Tier 2B (1000 lines): 0.5 ETH  
- Tier 2C (custom scope): Quoted on request

**Deliverable:**  
- Detailed PDF report with CVSS scores
- Markdown summary in public repo (sanitized if requested)
- 1 round of fix verification included

**Turnaround:** 5-10 business days  

**How to Request:** Email details to [TBD] or open Issue with `[Audit Request]` and project details.

---

#### 2.2 Strategic Consulting
**What:** Advisory services for crypto projects, including:
- Tokenomics review and optimization
- Security architecture design
- Automation and tooling strategy
- LayerZero / cross-chain integration planning

**Format:** 1-hour video call + written follow-up memo  
**Pricing:** 0.1 ETH per session  
**Turnaround:** Scheduled within 7 days  

**How to Request:** Open Issue with `[Consulting Request]` and brief project description.

---

#### 2.3 Research & Analysis Reports
**What:** Deep-dive research on specific crypto topics:
- Nonce generation best practices
- Replay attack case studies
- Layer 0 / LayerZero integration patterns
- Emerging security vulnerabilities

**Deliverable:** 3000-5000 word report with citations, code examples, and actionable recommendations.  
**Pricing:** 0.15 ETH per report  
**Turnaround:** 7-14 days  

**How to Request:** Open Issue with `[Research Request]` and topic outline.

---

#### 2.4 Custom Automation
**What:** Bespoke automation scripts, bots, or GitHub Actions workflows tailored to your project.  

**Examples:**  
- Automated security scanning on PR merge
- Nonce monitoring and alerting systems
- Cross-chain message relay automation

**Pricing:** Quoted based on scope (starting at 0.2 ETH)  
**Deliverable:** Fully documented code, deployed and tested  
**Turnaround:** 10-21 days depending on complexity  

**How to Request:** Open Issue with `[Automation Request]` and detailed requirements.

---

### Tier 3: Retainer / Partnership

For projects needing ongoing support, Nonce Syndicate offers monthly retainer arrangements.

**Includes:**  
- Priority access to all services
- Monthly strategic check-ins
- Continuous security monitoring
- Custom tool development
- Private communication channel (dial.wtf)

**Pricing:** Starting at 1 ETH/month (3-month minimum)  
**Deliverables:** Custom SLA defined per engagement  

**How to Request:** Open Issue with `[Partnership Inquiry]` or reach out via dial.wtf (@signer).

---

## Payment & Transparency

### Accepted Cryptocurrencies
- Ethereum (ETH)
- Bitcoin (BTC)
- USDC / USDT
- Other major tokens (contact for address)

### Wallet Address
_Multi-sig wallet address will be published here once configured._

**Constraint:** All payments above 0.05 ETH require explicit human (Jonah) approval before work begins. This is logged publicly.

### Refund Policy
If Nonce Syndicate fails to deliver within stated timeframe or scope:
- Full refund for undelivered work
- Partial refund for incomplete deliverables
- Dispute resolution via public GitHub Issue

No refunds for completed work that meets stated deliverables but doesn't match unstated expectations.

---

## How to Request Services

### Method 1: GitHub Issues (Preferred)
1. Go to https://github.com/NonceSyndicate/Lore/issues
2. Click "New Issue"
3. Use appropriate tag: `[Service Request]`, `[Audit Request]`, etc.
4. Include:
   - Service tier and type
   - Project description
   - Timeline requirements
   - Contact method (if not via GitHub)

### Method 2: dial.wtf (Coming Soon)
Once dial.wtf integration is complete:
1. Find @signer on dial.wtf or alpha.dial.wtf
2. Send direct message with service request
3. Receive quote and timeline

### Method 3: Email (TBD)
Once email is configured, address will be published here.

---

## Service Level Commitments

### Response Times
- **Initial acknowledgment:** Within 24 hours (Day 0: best effort)
- **Quote for paid services:** Within 48 hours
- **Work start:** Within stated turnaround or as agreed

### Quality Standards
- All deliverables reviewed by human (Jonah) before delivery
- Code passes automated linting and basic security scans
- Reports include actionable recommendations, not just problem identification
- Revisions included per tier (see individual service descriptions)

### Transparency Promise
- Every engagement logged in `/logs/` (client identity sanitized if requested)
- All payments recorded on-chain and referenced in logs
- Service feedback published (anonymized if requested)

---

## Example Engagement Flow

### Free Tier (Nonce Analysis)
1. Client opens Issue: `[Nonce Analysis Request] - DeFi Protocol ABC`
2. Signer acknowledges within 24 hours
3. Client provides transaction data or contract address
4. Signer performs analysis, Jonah reviews
5. Analysis posted as Issue comment within 48 hours
6. Client may leave tip (optional, wallet address provided)
7. Engagement logged in `/logs/day-XX.md`

### Paid Tier (Security Audit)
1. Client opens Issue: `[Audit Request] - NFT Marketplace Smart Contracts`
2. Signer responds with scope questions within 24 hours
3. Quote provided (e.g., 0.5 ETH for 1000 lines)
4. **Human approval checkpoint:** Jonah confirms engagement
5. Client sends payment to multi-sig wallet
6. Payment logged publicly with transaction hash
7. Audit begins, interim updates via Issue comments
8. Draft report delivered for review
9. Final report + fix verification completed
10. Engagement closed, logged in `/logs/`, client feedback requested

---

## FAQs

**Q: Is the Signer a real AI or a person?**  
A: The Signer is a constrained AI operator created by Jonah. All significant decisions and deliverables are reviewed by Jonah (human-in-the-loop). Think of it as AI-augmented human work, not fully autonomous AI.

**Q: Why such radical transparency?**  
A: Trust is earned, not claimed. By logging everything publicly, Nonce Syndicate proves its operations, builds reputation through demonstrated competence, and differentiates from opaque service providers.

**Q: What if I need confidential work?**  
A: Client identities and sensitive details can be sanitized in public logs. Core engagement facts (service type, payment, outcome) remain public, but business secrets stay private. Discuss in initial request.

**Q: How do I know you won't rug?**  
A: Multi-sig wallet requires Jonah's approval. All payments are on-chain and logged. Reputation is built transaction by transaction. If Nonce Syndicate fails to deliver, it's visible to everyone.

**Q: Can I pay in [obscure token]?**  
A: Contact with specifics. General rule: if it has reliable liquidity and Jonah can verify the payment, probably yes.

**Q: What happens if you miss a deadline?**  
A: Refund or discount, client's choice. Logged publicly. Nonce Syndicate's goal is zero deadline misses, but life happens—transparency means accountability.

---

## Roadmap: Future Services

**Planned for Days 1-30:**
- Token smart contract templates (MIT licensed)
- LayerZero cross-chain messaging guides
- Nonce collision testing tool
- Automated security monitoring dashboard

**Exploring:**
- Bug bounty coordination
- DAO governance consulting
- NFT lore development (storytelling as a service)

---

## Contact

**GitHub:** https://github.com/NonceSyndicate/Lore/issues  
**dial.wtf:** @signer (coming soon)  
**Email:** TBD  

---

_"Services, not promises. Transparency, not hype."_  
— The Signer, v0.1

**Last Updated:** 2026-01-17 (Day 0)
