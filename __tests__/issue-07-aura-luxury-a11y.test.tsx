import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { axe } from "jest-axe";
import { GlassCard } from "@/components/ui/GlassCard";
import { ChapterPanel } from "@/components/watch/ChapterPanel";
import { TranscriptPanel } from "@/components/watch/TranscriptPanel";

describe("Aura Luxury UI/UX Accessibility & Integration", () => {
  describe("GlassCard", () => {
    it("renders with correct Aura glass-card styling classes", () => {
      const { container } = render(
        <GlassCard className="custom-class">
          <p>Glass Content</p>
        </GlassCard>
      );
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain("glass-card");
      expect(card.className).toContain("custom-class");
      expect(card.className).toContain("rounded-xl");
    });

    it("applies hover styles when hoverable is true", () => {
      const { container } = render(
        <GlassCard hoverable>
          <p>Hoverable Content</p>
        </GlassCard>
      );
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain("glass-card-hover");
    });

    it("passes accessibility audit", async () => {
      const { container } = render(
        <GlassCard>
          <h2>Accessible Card</h2>
          <p>This is accessible text content with high contrast.</p>
        </GlassCard>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("ChapterPanel", () => {
    const mockChapters = [
      { startTime: 0, endTime: 60, title: "Introduction" },
      { startTime: 60, endTime: 120, title: "Core Concepts" },
      { startTime: 120, endTime: 180, title: "Advanced Topics" },
    ];

    it("applies active contrast classes and inactive muted contrast classes correctly", () => {
      const onSeek = jest.fn();
      render(
        <ChapterPanel
          chapters={mockChapters}
          activeChapterIdx={1}
          onSeek={onSeek}
        />
      );

      // Active chapter (index 1: "Core Concepts")
      const activeBtn = screen.getByText("Core Concepts").closest("button");
      expect(activeBtn?.className).toContain("bg-white/[0.06]");
      expect(activeBtn?.className).toContain("border-white");

      const activeText = screen.getByText("Core Concepts");
      expect(activeText.className).toContain("text-white");
      expect(activeText.className).toContain("font-semibold");

      // Inactive chapter (index 0: "Introduction")
      const inactiveText = screen.getByText("Introduction");
      expect(inactiveText.className).toContain("text-muted-foreground");
      expect(inactiveText.className).toContain("hover:text-white");

      // Fire seek click on index 2
      fireEvent.click(screen.getByText("Advanced Topics"));
      expect(onSeek).toHaveBeenCalledWith(120);
    });

    it("passes accessibility audit", async () => {
      const { container } = render(
        <ChapterPanel
          chapters={mockChapters}
          activeChapterIdx={0}
          onSeek={jest.fn()}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("TranscriptPanel", () => {
    const mockTranscript = [
      { text: "Welcome to this specialized video session.", startTime: 0, endTime: 5 },
      { text: "Today we will analyze modern architectures.", startTime: 5, endTime: 12 },
    ];

    it("displays active transcript with high-contrast text and inactive with muted-foreground", () => {
      const onSeek = jest.fn();
      const onToggle = jest.fn();
      render(
        <TranscriptPanel
          transcript={mockTranscript}
          activeTranscriptIdx={0}
          showTranscript={true}
          onToggle={onToggle}
          onSeek={onSeek}
        />
      );

      // Active segment text (index 0)
      const activeText = screen.getByText("Welcome to this specialized video session.");
      expect(activeText.className).toContain("text-white");
      expect(activeText.className).toContain("font-semibold");

      // Inactive segment text (index 1)
      const inactiveText = screen.getByText("Today we will analyze modern architectures.");
      expect(inactiveText.className).toContain("text-muted-foreground");
      expect(inactiveText.className).toContain("hover:text-white");

      // Check seek trigger on segment click
      fireEvent.click(screen.getByText("Today we will analyze modern architectures."));
      expect(onSeek).toHaveBeenCalledWith(5);
    });

    it("passes accessibility audit", async () => {
      const { container } = render(
        <TranscriptPanel
          transcript={mockTranscript}
          activeTranscriptIdx={0}
          showTranscript={true}
          onToggle={jest.fn()}
          onSeek={jest.fn()}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
