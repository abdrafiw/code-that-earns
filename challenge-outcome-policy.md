# Challenge Outcome and Off-Platform Reward Policy

Status: Approved for product direction; advanced workflows deferred from MVP  
Requirement: TASK-001  
Scope: Global

Implementation note: the initial MVP does not collect reward-delivery details or
track fulfillment and disputes inside CTE. Sections 5, 9, 10, and 12 define the
future operating policy and must not be partially exposed in the MVP UI.

## 1. Purpose

CTE connects companies with developers through technical challenges. Companies
may recognize winners, offer rewards, or do both. CTE coordinates the workflow
but does not process or guarantee any payment or reward.

This policy defines the information a company must publish, what developers can
expect, how winners are selected and announced, and how optional rewards are
recorded.

## 2. Platform boundary

CTE will:

- Publish challenge terms and outcome details.
- Accept and track solution submissions.
- Record winner selection and public announcements.
- Privately collect approved reward-delivery details from selected winners only.
- Let companies and winners report reward-delivery status.
- Keep an audit history and accept disputes or reports.

CTE will not:

- Collect, hold, route, convert, escrow, transfer, or refund money.
- Execute bank, mobile-money, payment-service, or cryptocurrency transfers.
- Guarantee a company will deliver a promised reward.
- Independently confirm that an off-platform transfer succeeded.
- Request payment passwords, PINs, card details, private keys, seed phrases, or
  identity documents.

All product copy must describe reward status as reported by the participants,
not verified or processed by CTE.

## 3. Challenge outcome types

Every challenge must select exactly one outcome type before publication.

### 3.1 Recognition only

- No monetary or material reward is promised.
- The company must provide a recognition title, such as "Winner," "Top solution,"
  or "Selected developer."
- Winners may be announced publicly subject to their consent.
- No reward-delivery details or reward-status record is created.

### 3.2 Monetary reward

- The company promises a stated monetary amount to each selected winner.
- The amount must use integer minor units and an ISO 4217 currency code.
- The company must select at least one supported off-platform delivery method.
- Public recognition is optional and requires winner consent.

### 3.3 Non-monetary reward

- The company promises a clearly described item or benefit, such as hardware,
  event access, mentorship, an interview opportunity, or service credit.
- The description must state what each winner receives and any material limits.
- Public recognition is optional and requires winner consent.

### 3.4 Recognition and reward

- The challenge combines public recognition with a monetary or non-monetary
  reward.
- Recognition and reward terms must each satisfy their applicable rules.
- A winner may decline public recognition without losing an earned reward.

## 4. Winner configuration

- A challenge must define between 1 and 10 winners before publication.
- The displayed monetary amount or non-monetary reward is the amount or item each
  winner receives, not a shared pool.
- The company may define labels such as first place, second place, or winner.
- Different rewards by placement are outside the initial scope. A company that
  needs different rewards must create separate challenges.
- The configured winner count and per-winner outcome must be visible on the card
  and challenge details page.
- A company may select fewer winners only when there are fewer eligible
  submissions, and it must publish a reason.
- A company may not select more winners than the published limit.

## 5. Global reward methods

CTE must use an allowlist of structured templates rather than arbitrary questions.
A company selects the methods it can use during challenge creation. A winner then
chooses one of those methods after selection.

### 5.1 Bank transfer

Permitted fields:

- Account-holder name.
- Bank name.
- Country.
- Account number or IBAN.
- Routing, sort, branch, BSB, or SWIFT/BIC code when applicable.

### 5.2 Mobile money

Permitted fields:

- Provider name.
- Country and country code.
- Registered account name.
- Mobile number.

The provider list must be configurable by country rather than hard-coded to Ghana.

### 5.3 Payment-service handle or link

Permitted fields:

- Service name, such as Wise, PayPal, Payoneer, or another supported service.
- Recipient email, public handle, payment link, or payment-request link.

CTE must not imply that a named service is available in every country. The
company and developer are responsible for confirming availability and fees.

### 5.4 Cryptocurrency

Permitted fields:

- Asset or token.
- Network.
- Public receiving address.
- Destination tag or memo when the selected network requires it.

The asset and network must both be explicit. CTE must warn both parties to verify
the network before an off-platform transfer.

### 5.5 Manual delivery

This method is limited to non-monetary rewards. Permitted fields are the minimum
contact or delivery details reasonably required for the announced item or
benefit. Physical delivery addresses must be requested only when physical
delivery is necessary.

## 6. Required publication disclosures

Before publishing, the company must provide:

- Outcome type.
- Winner count and recognition label.
- Reward per winner, when applicable.
- Currency for monetary rewards.
- Supported reward-delivery methods.
- Delivery deadline, between 1 and 30 calendar days after results are finalized;
  the product default is 14 days.
- Countries or regions excluded from receiving the reward, or "No geographic
  restriction."
- Minimum age or other lawful eligibility restrictions, when applicable.
- Who bears transfer, conversion, network, withdrawal, tax, customs, and delivery
  fees.
- Any conditions a winning submission must satisfy before the outcome is granted.

The challenge details page must show these terms before a developer submits.

## 7. Publication and editing rules

- Draft outcome terms may be edited freely.
- After publication, the company may correct non-material text but may not reduce
  the reward, change its type, reduce the winner count, add eligibility
  restrictions, or shorten the reward-delivery deadline.
- Material outcome changes require cancellation and publication of a new
  challenge.
- Every post-publication edit must be timestamped and visible in the challenge
  history.

## 8. Winner selection and announcements

- Winner selection must occur through a privileged, atomic backend operation.
- Results are final only after the company explicitly confirms the selected set.
- Finalization rejects the remaining submissions and closes the challenge.
- Each winner controls whether their display name and profile link appear publicly.
- Consent may be collected with the submission and changed later from account
  settings.
- Without consent, the announcement displays "Private winner" and no identifying
  information.
- With consent, a completed challenge card may show winner names and link to the
  results section on the challenge details page.
- A global Winners page lists published results by challenge, company, category,
  and completion date.
- Declining or withdrawing publicity does not affect winner status or reward
  eligibility.

## 9. Private reward-detail workflow

- Only winners of rewarded challenges receive a request for delivery details.
- A winner selects one of the delivery methods published by the company.
- Details are visible only to that winner, the challenge-owning company, and an
  authorized administrator handling a report.
- Sensitive values must be encrypted at the application layer, masked by default,
  excluded from logs, and access-audited.
- Non-winners must never be asked for reward-delivery details.
- A winner may update details until the company marks the reward as sent.
- CTE should delete delivery details after the dispute window and required audit
  retention period have ended.

## 10. Reward status

Rewarded winners use the following self-reported states:

1. `details_required` — the winner has not provided delivery details.
2. `details_provided` — the company can access the submitted details.
3. `sent` — the company reports that it delivered the reward externally.
4. `confirmed` — the winner reports receipt.
5. `disputed` — the winner reports non-delivery, an incorrect amount or item, or
   another material issue.

The company may attach a safe reference or redacted proof when marking a reward
as sent. CTE must label the state as participant-reported and must not call it a
verified transaction.

## 11. Cancellation

- A company may cancel a challenge before its deadline only by providing a public
  reason.
- A challenge with no submissions may be cancelled immediately.
- A challenge with submissions requires confirmation that no winner will be
  selected and notifies every submitter.
- A challenge cannot be cancelled after results are finalized.
- CTE does not issue refunds because it never holds funds.
- Repeated cancellation after receiving submissions may trigger moderation.

## 12. Non-delivery and disputes

- A winner may open a dispute after the delivery deadline or earlier when the
  company explicitly refuses the published outcome.
- Both parties may add bounded notes and redacted evidence.
- An administrator may record the report as resolved, unresolved, withdrawn, or a
  policy violation.
- CTE cannot reverse or force an external transfer.
- Confirmed policy violations may result in challenge removal, restrictions,
  company suspension, or a visible account warning.
- Dispute outcomes and status changes must be audit logged.

## 13. Global operation rules

- CTE must not assume a user's country from currency, language, or payment method.
- Dates must be stored in UTC and displayed with the viewer's time zone.
- Monetary amounts must retain their published currency; CTE does not promise an
  exchange rate.
- Companies must disclose geographic and method restrictions before publication.
- Users are responsible for applicable taxes, reporting, provider rules, and local
  legal eligibility.
- Country, currency, mobile-money provider, and payment-service options must be
  configuration-driven so they can change without a client release.

## 14. Product terminology

Use:

- Challenge.
- Outcome.
- Recognition.
- Reward.
- Reward method.
- Reward details.
- Reward status.
- Company reported reward sent.
- Developer confirmed reward received.

Do not use:

- Bounty.
- Payout processed by CTE.
- CTE transaction.
- Escrow.
- Guaranteed payment.
- Verified payment, unless a future regulated integration genuinely verifies it.

## 15. TASK-001 acceptance decision

TASK-001 is approved when the product owner accepts:

- The four outcome types.
- The 1–10 winner limit.
- Per-winner rewards rather than shared reward pools.
- The five global reward-method templates.
- Winner-only collection of private reward details.
- The default 14-day and maximum 30-day delivery periods.
- Consent-based public winner announcements.
- Participant-reported reward status and CTE's non-payment role.
- The cancellation and dispute rules.

This document defines product behavior, not legal advice. The final public terms
must be reviewed for the jurisdictions in which CTE operates.
