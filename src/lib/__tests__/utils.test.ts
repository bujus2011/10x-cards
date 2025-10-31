import { describe, it, expect } from "vitest";
import { cn } from "../utils";

describe("cn utility function", () => {
  describe("basic functionality", () => {
    it("should merge single class name", () => {
      // Act
      const result = cn("text-red-500");

      // Assert
      expect(result).toBe("text-red-500");
    });

    it("should merge multiple class names", () => {
      // Act
      const result = cn("text-red-500", "bg-blue-500", "p-4");

      // Assert
      expect(result).toBe("text-red-500 bg-blue-500 p-4");
    });

    it("should handle empty string", () => {
      // Act
      const result = cn("");

      // Assert
      expect(result).toBe("");
    });

    it("should handle no arguments", () => {
      // Act
      const result = cn();

      // Assert
      expect(result).toBe("");
    });
  });

  describe("conditional classes", () => {
    it("should handle conditional classes with boolean true", () => {
      // Act
      const result = cn("base-class", true ? "conditional-class" : "");

      // Assert
      expect(result).toBe("base-class conditional-class");
    });

    it("should handle conditional classes with boolean false", () => {
      // Act
      const result = cn("base-class", false ? "conditional-class" : "");

      // Assert
      expect(result).toBe("base-class");
    });

    it("should handle undefined values", () => {
      // Act
      const result = cn("base-class", undefined, "another-class");

      // Assert
      expect(result).toBe("base-class another-class");
    });

    it("should handle null values", () => {
      // Act
      const result = cn("base-class", null, "another-class");

      // Assert
      expect(result).toBe("base-class another-class");
    });
  });

  describe("Tailwind CSS conflicts", () => {
    it("should handle conflicting padding classes", () => {
      // Act
      const result = cn("p-4", "p-8");

      // Assert
      // tailwind-merge should keep only the last padding class
      expect(result).toBe("p-8");
    });

    it("should handle conflicting text color classes", () => {
      // Act
      const result = cn("text-red-500", "text-blue-500");

      // Assert
      expect(result).toBe("text-blue-500");
    });

    it("should handle conflicting background color classes", () => {
      // Act
      const result = cn("bg-red-500", "bg-blue-500");

      // Assert
      expect(result).toBe("bg-blue-500");
    });

    it("should handle conflicting width classes", () => {
      // Act
      const result = cn("w-full", "w-1/2");

      // Assert
      expect(result).toBe("w-1/2");
    });

    it("should handle conflicting height classes", () => {
      // Act
      const result = cn("h-screen", "h-auto");

      // Assert
      expect(result).toBe("h-auto");
    });

    it("should preserve non-conflicting classes", () => {
      // Act
      const result = cn("text-red-500", "bg-blue-500", "p-4", "m-2");

      // Assert
      expect(result).toContain("text-red-500");
      expect(result).toContain("bg-blue-500");
      expect(result).toContain("p-4");
      expect(result).toContain("m-2");
    });
  });

  describe("array inputs", () => {
    it("should handle array of class names", () => {
      // Act
      const result = cn(["text-red-500", "bg-blue-500"]);

      // Assert
      expect(result).toBe("text-red-500 bg-blue-500");
    });

    it("should handle nested arrays", () => {
      // Act
      const result = cn(["text-red-500", ["bg-blue-500", "p-4"]]);

      // Assert
      expect(result).toContain("text-red-500");
      expect(result).toContain("bg-blue-500");
      expect(result).toContain("p-4");
    });

    it("should handle mixed string and array inputs", () => {
      // Act
      const result = cn("text-red-500", ["bg-blue-500", "p-4"], "m-2");

      // Assert
      expect(result).toContain("text-red-500");
      expect(result).toContain("bg-blue-500");
      expect(result).toContain("p-4");
      expect(result).toContain("m-2");
    });
  });

  describe("object inputs", () => {
    it("should handle object with boolean values", () => {
      // Act
      const result = cn({
        "text-red-500": true,
        "bg-blue-500": false,
        "p-4": true,
      });

      // Assert
      expect(result).toContain("text-red-500");
      expect(result).not.toContain("bg-blue-500");
      expect(result).toContain("p-4");
    });

    it("should handle mixed object and string inputs", () => {
      // Act
      const result = cn("base-class", {
        active: true,
        disabled: false,
      });

      // Assert
      expect(result).toContain("base-class");
      expect(result).toContain("active");
      expect(result).not.toContain("disabled");
    });
  });

  describe("complex scenarios", () => {
    it("should handle complex combination of inputs", () => {
      // Arrange
      const isActive = true;
      const isDisabled = false;
      const size = "large";

      // Act
      const result = cn(
        "base-button",
        isActive && "active",
        isDisabled && "disabled",
        {
          "size-small": size === "small",
          "size-large": size === "large",
        },
        ["rounded", "shadow"]
      );

      // Assert
      expect(result).toContain("base-button");
      expect(result).toContain("active");
      expect(result).not.toContain("disabled");
      expect(result).toContain("size-large");
      expect(result).not.toContain("size-small");
      expect(result).toContain("rounded");
      expect(result).toContain("shadow");
    });

    it("should handle responsive classes", () => {
      // Act
      const result = cn("text-sm", "md:text-base", "lg:text-lg");

      // Assert
      expect(result).toContain("text-sm");
      expect(result).toContain("md:text-base");
      expect(result).toContain("lg:text-lg");
    });

    it("should handle hover and focus states", () => {
      // Act
      const result = cn("bg-blue-500", "hover:bg-blue-700", "focus:ring-2");

      // Assert
      expect(result).toContain("bg-blue-500");
      expect(result).toContain("hover:bg-blue-700");
      expect(result).toContain("focus:ring-2");
    });

    it("should handle dark mode classes", () => {
      // Act
      const result = cn("bg-white", "dark:bg-gray-900", "text-black", "dark:text-white");

      // Assert
      expect(result).toContain("bg-white");
      expect(result).toContain("dark:bg-gray-900");
      expect(result).toContain("text-black");
      expect(result).toContain("dark:text-white");
    });
  });

  describe("edge cases", () => {
    it("should handle whitespace in class names", () => {
      // Act
      const result = cn("  text-red-500  ", "  bg-blue-500  ");

      // Assert
      expect(result).toContain("text-red-500");
      expect(result).toContain("bg-blue-500");
    });

    it("should handle duplicate class names", () => {
      // Act
      const result = cn("text-red-500", "bg-blue-500", "text-red-500");

      // Assert
      // Should only include text-red-500 once
      const matches = result.match(/text-red-500/g);
      expect(matches).toHaveLength(1);
    });

    it("should handle very long class lists", () => {
      // Act
      const result = cn(
        "class1",
        "class2",
        "class3",
        "class4",
        "class5",
        "class6",
        "class7",
        "class8",
        "class9",
        "class10"
      );

      // Assert
      expect(result).toContain("class1");
      expect(result).toContain("class5");
      expect(result).toContain("class10");
    });

    it("should handle special characters in class names", () => {
      // Act
      const result = cn("w-[100px]", "h-[50px]", "bg-[#ff0000]");

      // Assert
      expect(result).toContain("w-[100px]");
      expect(result).toContain("h-[50px]");
      expect(result).toContain("bg-[#ff0000]");
    });

    it("should handle numbers in class names", () => {
      // Act
      const result = cn("col-span-1", "row-span-2", "z-10");

      // Assert
      expect(result).toContain("col-span-1");
      expect(result).toContain("row-span-2");
      expect(result).toContain("z-10");
    });
  });

  describe("real-world usage scenarios", () => {
    it("should work with button variants", () => {
      // Arrange
      const variant = "primary";
      const size = "md";
      const disabled = false;

      // Act
      const result = cn(
        "btn",
        {
          "btn-primary": variant === "primary",
          "btn-secondary": variant === "secondary",
        },
        {
          "btn-sm": size === "sm",
          "btn-md": size === "md",
          "btn-lg": size === "lg",
        },
        disabled && "btn-disabled"
      );

      // Assert
      expect(result).toContain("btn");
      expect(result).toContain("btn-primary");
      expect(result).toContain("btn-md");
      expect(result).not.toContain("btn-disabled");
    });

    it("should work with card components", () => {
      // Arrange
      const isHoverable = true;
      const hasShadow = true;

      // Act
      const result = cn(
        "rounded-lg",
        "border",
        "border-gray-200",
        isHoverable && "hover:shadow-lg transition-shadow",
        hasShadow && "shadow-md"
      );

      // Assert
      expect(result).toContain("rounded-lg");
      expect(result).toContain("border");
      expect(result).toContain("hover:shadow-lg");
      expect(result).toContain("shadow-md");
    });

    it("should work with input states", () => {
      // Arrange
      const hasError = false;
      const isDisabled = false;
      const isFocused = true;

      // Act
      const result = cn(
        "input",
        "border",
        "rounded",
        hasError && "border-red-500",
        isDisabled && "opacity-50 cursor-not-allowed",
        isFocused && "ring-2 ring-blue-500"
      );

      // Assert
      expect(result).toContain("input");
      expect(result).toContain("border");
      expect(result).not.toContain("border-red-500");
      expect(result).not.toContain("opacity-50");
      expect(result).toContain("ring-2");
    });
  });

  describe("type safety", () => {
    it("should accept string argument", () => {
      // Act & Assert
      expect(() => cn("text-red-500")).not.toThrow();
    });

    it("should accept multiple arguments", () => {
      // Act & Assert
      expect(() => cn("class1", "class2", "class3")).not.toThrow();
    });

    it("should accept mixed types", () => {
      // Act & Assert
      expect(() => cn("base", undefined, null, false, ["array"], { object: true })).not.toThrow();
    });
  });
});
