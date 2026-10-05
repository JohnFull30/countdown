import { act, fireEvent, render, screen } from "@testing-library/react";
import GenderCountdown from "./GenderCountdown";
import { supabase } from "./supabaseClient";

jest.mock("react-router-dom", () => ({
  useLocation: () => ({ search: "?revealId=secret-token&duration=1&gender=boy&customGifUrl=https://example.com/leak.gif" }),
  useNavigate: () => jest.fn(),
}), { virtual: true });
jest.mock("./supabaseClient", () => ({ supabase: { rpc: jest.fn(), from: jest.fn() } }));
jest.mock("./analytics", () => ({ trackEvent: jest.fn().mockResolvedValue() }));
jest.mock("canvas-confetti", () => jest.fn());

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
});
afterEach(() => jest.useRealTimers());

test("secret uses server duration and receives no secret before server releases it", async () => {
  supabase.rpc.mockImplementation(async (name) => name === "start_reveal"
    ? { data: { ticket: "ticket", duration_seconds: 3 } }
    : { data: null });
  const { container } = render(<GenderCountdown />);
  expect(supabase.rpc).not.toHaveBeenCalled();
  await act(async () => fireEvent.click(screen.getByText("Start Countdown")));
  expect(supabase.rpc).toHaveBeenCalledTimes(1);
  await act(async () => jest.advanceTimersByTime(2000));
  expect(supabase.rpc).toHaveBeenCalledTimes(1);
  await act(async () => jest.advanceTimersByTime(1000));
  expect(supabase.rpc).toHaveBeenLastCalledWith("finish_reveal", { p_ticket: "ticket" });
  expect(container.querySelector("img, video")).toBeNull();
  expect(screen.queryByText(/IT'S A/)).not.toBeInTheDocument();
  supabase.rpc.mockResolvedValue({ data: { gender: "girl", fireworks: false, custom_gif_url: "https://example.com/girl.gif" } });
  await act(async () => jest.advanceTimersByTime(1000));
  expect(screen.getByText("IT'S A GIRL!")).toBeInTheDocument();
  expect(container.querySelector("img")).toHaveAttribute("src", "https://example.com/girl.gif");
  expect(supabase.from).not.toHaveBeenCalled();
});

test("start failure stays neutral and allows retry", async () => {
  supabase.rpc.mockResolvedValue({ error: new Error("denied") });
  const { container } = render(<GenderCountdown />);
  await act(async () => fireEvent.click(screen.getByText("Start Countdown")));
  expect(screen.getByRole("alert")).toHaveTextContent("Could not start");
  expect(screen.getByText("Start Countdown")).toBeEnabled();
  expect(container.querySelector("img, video")).toBeNull();
});

test("finish failure never falls back to a guessed gender", async () => {
  supabase.rpc.mockResolvedValueOnce({ data: { ticket: "ticket", duration_seconds: 1 } })
    .mockResolvedValue({ error: new Error("offline") });
  render(<GenderCountdown />);
  await act(async () => fireEvent.click(screen.getByText("Start Countdown")));
  await act(async () => jest.advanceTimersByTime(1000));
  expect(screen.getByRole("alert")).toHaveTextContent("Could not retrieve");
  expect(screen.queryByText(/IT'S A/)).not.toBeInTheDocument();
});
