import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ClearDataButton } from "../ClearDataButton";

describe("ClearDataButton", () => {
  const mockFetch = vi.fn();
  const mockConfirm = vi.fn();
  const mockLocation = { href: "" };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock fetch
    global.fetch = mockFetch;

    // Mock confirm
    global.confirm = mockConfirm;

    // Mock window.location
    Object.defineProperty(window, "location", {
      value: mockLocation,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders without crashing", () => {
    render(<ClearDataButton />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("displays correct button text", () => {
    render(<ClearDataButton />);
    expect(screen.getByText("Clear corrupted data")).toBeInTheDocument();
  });

  it("has correct button styling", () => {
    render(<ClearDataButton />);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("text-red-400");
    expect(button).toHaveClass("underline");
  });

  describe("Confirmation dialog", () => {
    it("shows confirmation dialog when clicked", () => {
      mockConfirm.mockReturnValue(false);
      render(<ClearDataButton />);

      fireEvent.click(screen.getByRole("button"));

      expect(mockConfirm).toHaveBeenCalledTimes(1);
      expect(mockConfirm).toHaveBeenCalledWith(
        "Are you sure you want to clear all game data and start fresh? This cannot be undone."
      );
    });

    it("does not make API calls if user cancels", () => {
      mockConfirm.mockReturnValue(false);
      render(<ClearDataButton />);

      fireEvent.click(screen.getByRole("button"));

      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe("API calls", () => {
    it("calls both clear endpoints when confirmed", async () => {
      mockConfirm.mockReturnValue(true);
      mockFetch.mockResolvedValue({ ok: true });

      render(<ClearDataButton />);
      fireEvent.click(screen.getByRole("button"));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2);
      });

      expect(mockFetch).toHaveBeenCalledWith("/api/admin/clear-games", { method: "POST" });
      expect(mockFetch).toHaveBeenCalledWith("/api/admin/clear-cookies", { method: "POST" });
    });

    it("redirects to game page with newGame param on success", async () => {
      mockConfirm.mockReturnValue(true);
      mockFetch.mockResolvedValue({ ok: true });

      render(<ClearDataButton />);
      fireEvent.click(screen.getByRole("button"));

      await waitFor(() => {
        expect(mockLocation.href).toBe("/game?newGame=true");
      });
    });
  });

  describe("Loading state", () => {
    it("shows loading text while clearing", async () => {
      mockConfirm.mockReturnValue(true);
      // Create a promise that we can control
      let resolvePromise: (value: { ok: boolean }) => void;
      const pendingPromise = new Promise<{ ok: boolean }>((resolve) => {
        resolvePromise = resolve;
      });
      mockFetch.mockReturnValue(pendingPromise);

      render(<ClearDataButton />);
      fireEvent.click(screen.getByRole("button"));

      expect(screen.getByText("Clearing...")).toBeInTheDocument();

      // Resolve the promise to cleanup
      resolvePromise!({ ok: true });
    });

    it("disables button while clearing", async () => {
      mockConfirm.mockReturnValue(true);
      let resolvePromise: (value: { ok: boolean }) => void;
      const pendingPromise = new Promise<{ ok: boolean }>((resolve) => {
        resolvePromise = resolve;
      });
      mockFetch.mockReturnValue(pendingPromise);

      render(<ClearDataButton />);
      fireEvent.click(screen.getByRole("button"));

      expect(screen.getByRole("button")).toBeDisabled();

      // Resolve the promise to cleanup
      resolvePromise!({ ok: true });
    });
  });

  describe("Error handling", () => {
    it("shows alert on API failure", async () => {
      mockConfirm.mockReturnValue(true);
      mockFetch.mockResolvedValue({ ok: false });

      const mockAlert = vi.fn();
      global.alert = mockAlert;

      render(<ClearDataButton />);
      fireEvent.click(screen.getByRole("button"));

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith("Failed to clear data. Check console for details.");
      });
    });

    it("shows alert on network error", async () => {
      mockConfirm.mockReturnValue(true);
      mockFetch.mockRejectedValue(new Error("Network error"));

      const mockAlert = vi.fn();
      global.alert = mockAlert;

      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      render(<ClearDataButton />);
      fireEvent.click(screen.getByRole("button"));

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith("Failed to clear data. Check console for details.");
      });

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it("re-enables button after error", async () => {
      mockConfirm.mockReturnValue(true);
      mockFetch.mockRejectedValue(new Error("Network error"));

      const mockAlert = vi.fn();
      global.alert = mockAlert;
      vi.spyOn(console, "error").mockImplementation(() => {});

      render(<ClearDataButton />);
      fireEvent.click(screen.getByRole("button"));

      await waitFor(() => {
        expect(screen.getByRole("button")).not.toBeDisabled();
      });

      expect(screen.getByText("Clear corrupted data")).toBeInTheDocument();
    });
  });

  describe("Button type", () => {
    it("has type button to prevent form submission", () => {
      render(<ClearDataButton />);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("type", "button");
    });
  });
});
