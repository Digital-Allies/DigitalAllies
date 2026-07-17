# DNS-AID draft records — NOT LIVE, do not publish yet

Drafted 2026-07-17 in response to an `isitagentready.com` scan flagging
"DNS for AI Discovery (DNS-AID) well-known entrypoint records not found."

## Why this is a draft, not a ready-to-apply change

DNS-AID (`draft-mozleywilliams-dnsop-dnsaid-02`, an individual IETF draft —
**not an approved RFC**, expires 2026-11-28) publishes SVCB/HTTPS records
that point to a live **agent endpoint** speaking a protocol like MCP or A2A
(`alpn=mcp` / `alpn=a2a`). digitalallies.net doesn't run one of those today —
it's a static HTML site with no backend API, and the "MCP Server Card" item
from the same scan was skipped for the same reason. Publishing SVCB records
with a `target` that resolves to nothing, or an `alpn` for a protocol nothing
actually speaks, would be worse than publishing nothing: agents that trust
DNS-AID would get a connection refusal or 404 instead of a clean "not
supported" signal.

**Do not add these to the live zone until one of these is true:**
1. Digital Allies stands up a real MCP or A2A server for digitalallies.net
   (there is currently no plan to; this would be a new backend service), or
2. The draft spec reaches wider adoption and defines a documented way to
   signal "no agent endpoint, informational only" — it doesn't today.

Also required before publishing *any* version of this: the zone must be
**DNSSEC-signed**, or validating resolvers won't treat the records as
authenticated and the whole point (trustable agent discovery) is lost. Check
whether DNSSEC is already enabled wherever digitalallies.net's DNS is hosted
before doing anything else here.

## Where these go

Both records live at the zone apex's DNS-SD-style labels, added through
whatever service hosts the `digitalallies.net` DNS zone (registrar or DNS
provider — not something set from this repo or from Vercel). They are DNS
records, not files served by the site.

## Draft record — organizational agent index

Per Section 3.2 of the draft, this is the well-known entry point a client
queries when it trusts `digitalallies.net` but doesn't know which agent
provides a capability:

```
_index._agents.digitalallies.net. 3600 IN SVCB 1 TARGET-TBD.digitalallies.net (
    <params TBD once a real agent index exists>
)
```

`TARGET-TBD` must be filled in with the real host serving the agent index
once one exists — the spec explicitly requires the TargetName here (not `.`)
and forbids underscores in it, since it's also used for a TLSA lookup.

## Draft record — a specific agent (example shape only)

Per Section 3.1, if/when Digital Allies stands up a single MCP-speaking
agent, e.g. as `agent.digitalallies.net`:

```
agent.digitalallies.net. 3600 IN SVCB 1 . (
    alpn="mcp"
    port=443
    well-known=/.well-known/mcp/server-card.json
)
```

This mirrors the "MCP Server Card" checklist item — the two would ship
together, since the `well-known` param here is exactly the server-card path
that item asks for.

## Next steps when this becomes real

1. Confirm DNSSEC is enabled on the digitalallies.net zone.
2. Stand up the real MCP/A2A endpoint and its `/.well-known/mcp/server-card.json`.
3. Replace `TARGET-TBD` above with the real hostname and fill in the SVCB params.
4. Add both records at the DNS provider's dashboard (or via their API/Terraform
   if that's how the zone is managed) — this is a production DNS change and
   should be reviewed before applying, same as any other DNS edit.
5. Re-run the `isitagentready.com` scan to confirm.

## References

- Draft spec: https://datatracker.ietf.org/doc/draft-mozleywilliams-dnsop-dnsaid/
- SVCB/HTTPS records: https://www.rfc-editor.org/rfc/rfc9460
