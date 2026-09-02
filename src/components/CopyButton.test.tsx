import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CopyButton } from "./CopyButton";

describe("CopyButton", () => {
  it("copies the exact provided text to the clipboard and shows confirmation", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(<CopyButton text={"line one\nline two"} />);
    fireEvent.click(screen.getByRole("button", { name: "Copier" }));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith("line one\nline two"));
    expect(await screen.findByRole("button", { name: "Copié" })).toBeInTheDocument();
  });
});
