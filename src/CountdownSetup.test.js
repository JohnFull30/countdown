import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import CountdownSetup from "./CountdownSetup";
import { supabase } from "./supabaseClient";

const mockNavigate = jest.fn();
const mockSave = jest.fn();
const mockLog = jest.fn();

jest.mock("react-router-dom", () => {
  const React = require("react");
  return {
    Link: React.forwardRef(({ to, children, ...props }, ref) =>
      React.createElement("a", { href: to, ref, ...props }, children)
    ),
    useLocation: () => ({ pathname: "/" }),
    useNavigate: () => mockNavigate,
  };
}, { virtual: true });
jest.mock("./supabaseClient", () => ({ supabase: { from: jest.fn() } }));
jest.mock("./analytics", () => ({ trackEvent: jest.fn().mockResolvedValue() }));
jest.mock("./config/stripeConfig", () => ({ mode: "test" }));

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  localStorage.setItem("secretMode", "true");
  mockSave.mockReset().mockResolvedValue({ error: null });
  mockLog.mockReset().mockResolvedValue({ error: null });
  supabase.from.mockImplementation((table) =>
    table === "reveals" ? { upsert: mockSave } : { insert: mockLog }
  );
});

function start() {
  fireEvent.click(screen.getByRole("button", { name: "Start Countdown" }));
}

function expectSecretLink() {
  const url = new URL(mockNavigate.mock.calls[0][0], "https://example.com");
  expect(url.pathname).toBe("/countdown");
  expect(url.searchParams.has("gender")).toBe(false);
  expect(url.searchParams.get("revealId")).toBe(mockSave.mock.calls.at(-1)[0][0].id);
  return url;
}

test.each(["returned", "thrown"])("%s save failure stays on setup and retries safely", async (kind) => {
  if (kind === "returned") mockSave.mockResolvedValueOnce({ error: new Error("failed") });
  else mockSave.mockRejectedValueOnce(new Error("offline"));
  render(<CountdownSetup />);
  fireEvent.click(screen.getByRole("button", { name: /GIRL/ }));
  fireEvent.click(screen.getByRole("button", { name: "Increase duration" }));
  start();
  expect(await screen.findByRole("alert")).toHaveTextContent("No share link was created");
  expect(mockNavigate).not.toHaveBeenCalled();
  expect(mockLog).not.toHaveBeenCalled();
  expect(localStorage.getItem("freeTries")).toBeNull();
  expect(screen.getByText(/You have 3 free premium/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Retry saving countdown" }));
  await waitFor(() => expect(mockNavigate).toHaveBeenCalledTimes(1));
  expect(mockSave).toHaveBeenCalledTimes(2);
  expect(mockSave.mock.calls[1][0][0]).toMatchObject({ gender: "girl", duration_seconds: 2, fireworks: true });
  expect(expectSecretLink().searchParams.get("duration")).toBe("2");
  expect(localStorage.getItem("freeTries")).toBe("2");
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});

test("pending save blocks duplicate submissions and creates a secret link only on success", async () => {
  let resolveSave;
  mockSave.mockReturnValueOnce(new Promise((resolve) => { resolveSave = resolve; }));
  render(<CountdownSetup />);
  const button = screen.getByRole("button", { name: "Start Countdown" });
  act(() => { button.click(); button.click(); });
  expect(button).toBeDisabled();
  expect(button).toHaveAttribute("aria-busy", "true");
  expect(mockSave).toHaveBeenCalledTimes(1);
  expect(mockNavigate).not.toHaveBeenCalled();
  await act(async () => resolveSave({ error: null }));
  expect(mockNavigate).toHaveBeenCalledTimes(1);
  expectSecretLink();
  expect(mockLog).toHaveBeenCalledTimes(1);
});

test("ordinary countdown creation retains its settings", async () => {
  localStorage.setItem("secretMode", "false");
  render(<CountdownSetup />);
  start();
  await waitFor(() => expect(mockNavigate).toHaveBeenCalledTimes(1));
  const query = new URL(mockNavigate.mock.calls[0][0], "https://example.com").searchParams;
  expect(Object.fromEntries(query)).toEqual({ duration: "1", gender: "boy", customGifUrl: "", fireworks: "true" });
  expect(mockSave).not.toHaveBeenCalled();
  expect(mockLog).toHaveBeenCalledTimes(1);
});
