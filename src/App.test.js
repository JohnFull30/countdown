import { render, screen } from "@testing-library/react";
import App from "./App";
import { SUPPORT_EMAIL } from "./config/contact";

let mockPath = "/support";
let mockSearch = "";

jest.mock(
  "react-router-dom",
  () => {
    const React = require("react");

    return {
      Link: React.forwardRef(({ to, children, ...props }, ref) =>
        React.createElement("a", { href: to, ref, ...props }, children)
      ),
      Navigate: () => null,
      Route: () => null,
      Routes: ({ children }) =>
        React.Children.toArray(children).find(
          (child) => child.props.path === mockPath
        )?.props.element || null,
      useLocation: () => ({ pathname: mockPath, search: mockSearch }),
      useNavigate: () => jest.fn(),
    };
  },
  { virtual: true }
);

jest.mock("./config/stripeConfig", () => ({
  __esModule: true,
  default: {
    activePriceId: "price_test",
    isLive: false,
    isTest: true,
    mode: "test",
  },
}));

jest.mock("./analytics", () => ({
  trackEvent: jest.fn(() => Promise.resolve()),
}));

jest.mock("./supabaseClient", () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn(),
      upsert: jest.fn(),
    })),
  },
}));

test("renders the support page with one email support action and no footer", () => {
  mockPath = "/support";
  mockSearch = "";

  const { container } = render(<App />);

  expect(
    screen.getByRole("heading", { name: /how can we help/i })
  ).toBeInTheDocument();
  expect(screen.queryByText(SUPPORT_EMAIL)).not.toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: "Email Pierre Fuller Labs support" })
  ).toHaveAttribute(
    "href",
    expect.stringContaining(
      `mailto:${SUPPORT_EMAIL}?subject=Countdown%20Support%20Request`
    )
  );
  expect(
    container.querySelectorAll(`a[href^="mailto:${SUPPORT_EMAIL}"]`)
  ).toHaveLength(1);
  expect(
    screen.queryByText("A Pierre Fuller Labs product.")
  ).not.toBeInTheDocument();
});

test("renders setup support only in premium card and global footer", () => {
  mockPath = "/";
  mockSearch = "";

  render(<App />);

  expect(screen.queryByText("Need help with Countdown?")).not.toBeInTheDocument();
  expect(
    screen.getByText("Countdown is built by an independent developer.")
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Tip the Developer with Stripe" })
  ).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Contact support" })).toHaveAttribute(
    "href",
    "/support"
  );
  expect(screen.getAllByText("A Pierre Fuller Labs product.")).toHaveLength(1);
});

test("renders the global support footer once on payment pages", () => {
  mockPath = "/payment-failed";
  mockSearch = "";

  render(<App />);

  expect(screen.getAllByText("A Pierre Fuller Labs product.")).toHaveLength(1);
  expect(
    screen.getByRole("link", { name: `Email support at ${SUPPORT_EMAIL}` })
  ).toHaveAttribute("href", expect.stringContaining(`mailto:${SUPPORT_EMAIL}`));
});

test("does not render the support footer during countdown reveal", () => {
  mockPath = "/countdown";
  mockSearch = "?duration=1&gender=boy";

  render(<App />);

  expect(
    screen.queryByText("A Pierre Fuller Labs product.")
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Start Countdown" })
  ).toBeInTheDocument();
});
