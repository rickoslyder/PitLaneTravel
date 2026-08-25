import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { ConsentBannerView } from "./consent-banner"

function render(props: Parameters<typeof ConsentBannerView>[0]) {
  return renderToStaticMarkup(createElement(ConsentBannerView, props))
}

const noop = () => {}

describe("consent banner markup", () => {
  it("shows undecided analytics copy and equal Accept analytics / Reject non-essential actions", () => {
    const html = render({
      status: "undecided",
      settingsOpen: false,
      onAccept: noop,
      onReject: noop,
      onWithdraw: noop,
      onOpenSettings: noop,
      onCloseSettings: noop
    })

    expect(html).toMatch(/<h2[^>]*>Usage analytics<\/h2>/)
    expect(html).toMatch(/nonessential usage analytics/)
    expect(html).toMatch(/PostHog/)
    expect(html).toMatch(/Google/)
    expect(html).toMatch(/Microsoft Clarity/)
    expect(html).toMatch(/Vercel Speed Insights/)
    expect(html).not.toMatch(/anonymous/i)
    expect(html).not.toMatch(/anonymized/i)
    expect(html).not.toMatch(/cookieless/i)
    expect(html).not.toMatch(/no identifiers/i)
    expect(html).toMatch(/<button[^>]*>Accept analytics<\/button>/)
    expect(html).toMatch(/<button[^>]*>Reject non-essential<\/button>/)
    expect(html).not.toMatch(/Withdraw analytics consent/)
    expect(html).not.toMatch(/>Privacy settings</)
    expect(html).not.toMatch(/personalization/)
    expect(html).not.toMatch(/advertising/)

    const accept = html.match(
      /<button([^>]*)>Accept analytics<\/button>/
    )?.[1]
    const reject = html.match(
      /<button([^>]*)>Reject non-essential<\/button>/
    )?.[1]
    expect(accept).toBeTruthy()
    expect(reject).toBeTruthy()
    expect(accept).toBe(reject)
  })

  it("keeps a persistent Privacy settings control after a decision", () => {
    const granted = render({
      status: "granted",
      settingsOpen: false,
      onAccept: noop,
      onReject: noop,
      onWithdraw: noop,
      onOpenSettings: noop,
      onCloseSettings: noop
    })
    expect(granted).toMatch(/<button[^>]*>Privacy settings<\/button>/)
    expect(granted).not.toMatch(/>Accept analytics</)
    expect(granted).not.toMatch(/>Reject non-essential</)

    const denied = render({
      status: "denied",
      settingsOpen: false,
      onAccept: noop,
      onReject: noop,
      onWithdraw: noop,
      onOpenSettings: noop,
      onCloseSettings: noop
    })
    expect(denied).toMatch(/<button[^>]*>Privacy settings<\/button>/)
  })

  it("lets a granted user withdraw and a denied user accept from reopened settings", () => {
    const withdraw = render({
      status: "granted",
      settingsOpen: true,
      onAccept: noop,
      onReject: noop,
      onWithdraw: noop,
      onOpenSettings: noop,
      onCloseSettings: noop
    })
    expect(withdraw).toMatch(/<button[^>]*>Withdraw analytics consent<\/button>/)
    expect(withdraw).toMatch(/<button[^>]*>Privacy settings<\/button>/)
    expect(withdraw).toMatch(/nonessential usage analytics/)
    expect(withdraw).toMatch(/PostHog/)
    expect(withdraw).toMatch(/Google/)
    expect(withdraw).toMatch(/Microsoft Clarity/)
    expect(withdraw).toMatch(/Vercel Speed Insights/)
    expect(withdraw).not.toMatch(/anonymous/i)
    expect(withdraw).not.toMatch(/anonymized/i)
    expect(withdraw).not.toMatch(/cookieless/i)
    expect(withdraw).not.toMatch(/no identifiers/i)

    const accept = render({
      status: "denied",
      settingsOpen: true,
      onAccept: noop,
      onReject: noop,
      onWithdraw: noop,
      onOpenSettings: noop,
      onCloseSettings: noop
    })
    expect(accept).toMatch(/<button[^>]*>Accept analytics<\/button>/)
    expect(accept).not.toMatch(/Withdraw analytics consent/)
  })

  it("renders the first-visit banner when invalid storage has already failed closed to undecided", () => {
    const html = render({
      status: "undecided",
      settingsOpen: false,
      onAccept: noop,
      onReject: noop,
      onWithdraw: noop,
      onOpenSettings: noop,
      onCloseSettings: noop
    })
    expect(html).toMatch(/>Accept analytics</)
    expect(html).toMatch(/>Reject non-essential</)
  })

  it("reserves extra mobile bottom clearance and restores desktop padding at sm", () => {
    const html = render({
      status: "undecided",
      settingsOpen: false,
      onAccept: noop,
      onReject: noop,
      onWithdraw: noop,
      onOpenSettings: noop,
      onCloseSettings: noop
    })

    const outer = html.match(
      /class="([^"]*\bfixed\b[^"]*\binset-x-0\b[^"]*\bbottom-0\b[^"]*)"/
    )?.[1]
    expect(outer, "outer consent shell class").toBeTruthy()
    expect(outer).toMatch(/\bp-3\b/)
    expect(outer).toMatch(/\bpb-(1[6-9]|[2-9]\d)\b/)
    expect(outer).toMatch(/\bsm:p-4\b/)
    expect(outer).not.toMatch(/overflow(?:-x|-y)?-hidden/)
  })
})
