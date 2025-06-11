"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/theme-provider";
import { generateCreditCard, generateMultipleCards, exportCardData } from "@/lib/cardGenerator";
import { toast } from "sonner";
import {
    CreditCard,
    Copy,
    Moon,
    Sun,
    Shuffle,
    Download,
    FileDown,
    CheckCircle,
    AlertCircle,
} from "lucide-react";

export default function CreditCardGenerator() {
    const [binPattern, setBinPattern] = useState("");
    const [cardCount, setCardCount] = useState(1);
    const [generatedCards, setGeneratedCards] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [exportFormat, setExportFormat] = useState("pipe");
    const [patternError, setPatternError] = useState("");
    const { theme, setTheme } = useTheme();

    // Validate pattern as user types
    const validatePattern = (pattern) => {
        if (!pattern.trim()) {
            setPatternError("Pattern cannot be empty");
            return false;
        }

        // Check for valid wildcards and structure
        const validWildcards = /^[0-9\*XxQ#_?\|\-\/:\s]+$/;
        if (!validWildcards.test(pattern)) {
            setPatternError("Invalid characters in pattern. Use only digits and wildcards: *, X, x, ?, #, _");
            return false;
        }

        setPatternError("");
        return true;
    };

    const handlePatternChange = (value) => {
        setBinPattern(value);
        validatePattern(value);
    };

    const handleGenerate = () => {
        if (!validatePattern(binPattern)) {
            toast.error("Invalid Pattern", {
                description: "Please check your BIN pattern and try again.",
            });
            return;
        }

        setIsGenerating(true);

        // Show generating toast
        const loadingToast = toast.loading(`Generating ${cardCount} card${cardCount !== 1 ? "s" : ""}...`, {
            description: "Please wait while we generate your cards.",
        });

        try {
            // Use batch generation for better performance
            const cards = generateMultipleCards(binPattern, cardCount);
            setGeneratedCards(cards);

            // Dismiss loading toast and show success
            toast.dismiss(loadingToast);
            toast.success("Cards Generated!", {
                description: `Successfully generated ${cards.length} card${cards.length !== 1 ? "s" : ""}.`,
                action: {
                    label: "Copy All",
                    onClick: () => {
                        const allCards = cards.map((card) => card.formatted).join("\n");
                        copyToClipboard(allCards, "All cards", false);
                    },
                },
            });
        } catch (error) {
            console.error("Error generating cards:", error);
            toast.dismiss(loadingToast);
            toast.error("Generation Failed", {
                description: "Error generating cards. Please check your pattern and try again.",
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = async (text, type = "card", showToast = true) => {
        try {
            await navigator.clipboard.writeText(text);
            if (showToast) {
                toast.success("Copied to Clipboard!", {
                    description: `${type} copied successfully.`,
                    duration: 2000,
                });
            }
        } catch (error) {
            console.error("Failed to copy:", error);
            if (showToast) {
                toast.error("Copy Failed", {
                    description: "Failed to copy to clipboard. Please try again.",
                });
            }
        }
    };

    const downloadCards = () => {
        if (generatedCards.length === 0) {
            toast.warning("No Cards to Export", {
                description: "Please generate some cards first.",
            });
            return;
        }

        try {
            const data = generatedCards.map((card) => exportCardData(card, exportFormat)).join("\n");
            const blob = new Blob([data], { type: "text/plain" });
            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = `credit_cards_${Date.now()}.${exportFormat === "json" ? "json" : "txt"}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success("Export Complete!", {
                description: `Downloaded ${
                    generatedCards.length
                } cards in ${exportFormat.toUpperCase()} format.`,
                duration: 3000,
            });
        } catch (error) {
            console.error("Export failed:", error);
            toast.error("Export Failed", {
                description: "Failed to download cards. Please try again.",
            });
        }
    };

    const toggleTheme = () => {
        const newTheme = theme === "dark" ? "light" : "dark";
        setTheme(newTheme);
        toast.success("Theme Changed", {
            description: `Switched to ${newTheme} mode.`,
            duration: 1500,
        });
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <CreditCard className="h-8 w-8 text-primary" />
                        <div>
                            <h1 className="text-3xl font-bold">Enhanced BIN Generator</h1>
                            <p className="text-muted-foreground">
                                Generate test credit card data with advanced wildcard support
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4" />
                        <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
                        <Moon className="h-4 w-4" />
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Input Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shuffle className="h-5 w-5" />
                                Generator Settings
                            </CardTitle>
                            <CardDescription>
                                Configure your credit card generation parameters with enhanced wildcard
                                support
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* BIN Pattern Input */}
                            <div className="space-y-2">
                                <Label htmlFor="bin-pattern">BIN Pattern</Label>
                                <Input
                                    id="bin-pattern"
                                    value={binPattern}
                                    onChange={(e) => handlePatternChange(e.target.value)}
                                    placeholder="e.g., 434769805926XXXX|10|2029|XXX"
                                    className={`font-mono ${patternError ? "border-red-500" : ""}`}
                                />
                                {patternError && (
                                    <div className="flex items-center gap-2 text-red-500 text-sm">
                                        <AlertCircle className="h-4 w-4" />
                                        {patternError}
                                    </div>
                                )}
                                <div className="text-sm text-muted-foreground space-y-2">
                                    <div>
                                        <strong>Supported Wildcards:</strong>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {["*", "X", "x", "?", "#", "_"].map((wildcard) => (
                                                <Badge key={wildcard} variant="outline" className="text-xs">
                                                    {wildcard}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <strong>Separators:</strong>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {["|", "/", ":", "-"].map((sep) => (
                                                <Badge key={sep} variant="secondary" className="text-xs">
                                                    {sep}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <p>
                                        <strong>Format:</strong> BIN*** or BIN***|MM|YY or BIN***|MM|YY|CVV
                                    </p>
                                    <p>
                                        <strong>Examples:</strong>
                                    </p>
                                    <ul className="list-disc list-inside ml-2 space-y-1">
                                        <li>
                                            <code>4532********</code> - Visa with random expiry/CVV
                                        </li>
                                        <li>
                                            <code>434769805926XXXX</code> - Visa with X wildcards
                                        </li>
                                        <li>
                                            <code>5555444433**|12|26</code> - Mastercard with specific expiry
                                        </li>
                                        <li>
                                            <code>434769805926XXXX|10|2029|XXX</code> - Full format with
                                            wildcards
                                        </li>
                                        <li>
                                            <code>374245######/XX/XX/????</code> - AmEx with multiple
                                            wildcards
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* Card Count Input */}
                            <div className="space-y-2">
                                <Label htmlFor="card-count">Number of Cards</Label>
                                <Input
                                    id="card-count"
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={cardCount}
                                    onChange={(e) =>
                                        setCardCount(
                                            Math.min(100, Math.max(1, parseInt(e.target.value) || 1))
                                        )
                                    }
                                />
                                <p className="text-sm text-muted-foreground">Generate 1-100 cards at once</p>
                            </div>

                            {/* Export Format Selection */}
                            <div className="space-y-2">
                                <Label htmlFor="export-format">Export Format</Label>
                                <Select
                                    value={exportFormat}
                                    onValueChange={(value) => {
                                        setExportFormat(value);
                                        toast.info("Export Format Changed", {
                                            description: `Selected ${value.toUpperCase()} format.`,
                                            duration: 1500,
                                        });
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select export format" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pipe">Pipe Separated (|)</SelectItem>
                                        <SelectItem value="csv">CSV Format</SelectItem>
                                        <SelectItem value="json">JSON Format</SelectItem>
                                        <SelectItem value="formatted">Human Readable</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Generate Button */}
                            <Button
                                onClick={handleGenerate}
                                disabled={isGenerating || !binPattern.trim() || !!patternError}
                                className="w-full"
                                size="lg"
                            >
                                {isGenerating ? (
                                    <>
                                        <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                                        Generating {cardCount} card{cardCount !== 1 ? "s" : ""}...
                                    </>
                                ) : (
                                    <>
                                        <Shuffle className="h-4 w-4 mr-2" />
                                        Generate {cardCount} Card{cardCount !== 1 ? "s" : ""}
                                    </>
                                )}
                            </Button>

                            {/* Usage Info */}
                            <div className="bg-muted/50 p-4 rounded-lg">
                                <h4 className="font-medium mb-2">⚠️ Important Notice</h4>
                                <p className="text-sm text-muted-foreground">
                                    These cards are for testing and educational purposes only. They use the
                                    Luhn algorithm to appear valid but are not real credit cards.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Results Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    Generated Cards
                                </span>
                                <div className="flex items-center gap-2">
                                    {generatedCards.length > 0 && (
                                        <>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={downloadCards}
                                                className="flex items-center gap-1"
                                            >
                                                <Download className="h-3 w-3" />
                                                Export
                                            </Button>
                                            <span className="text-sm font-normal text-muted-foreground">
                                                {generatedCards.length} card
                                                {generatedCards.length !== 1 ? "s" : ""}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </CardTitle>
                            <CardDescription>
                                {generatedCards.length > 0
                                    ? "Click any card to copy to clipboard"
                                    : "Generated cards will appear here"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {generatedCards.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No cards generated yet</p>
                                    <p className="text-sm">Enter a BIN pattern and click generate</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {generatedCards.map((card, index) => (
                                        <div
                                            key={index}
                                            className="group relative bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-800 dark:to-slate-600 p-4 rounded-lg text-white cursor-pointer hover:shadow-lg transition-all"
                                            onClick={() => copyToClipboard(card.formatted, "Card")}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium opacity-80">
                                                        {card.cardType}
                                                    </span>
                                                    <Badge variant="secondary" className="text-xs">
                                                        {card.cardNumber.length} digits
                                                    </Badge>
                                                </div>
                                                <Copy className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>

                                            <div className="font-mono text-lg tracking-wider mb-3">
                                                {card.cardNumber.replace(/(.{4})/g, "$1 ").trim()}
                                            </div>

                                            <div className="flex justify-between text-sm">
                                                <div>
                                                    <div className="opacity-60 text-xs">VALID THRU</div>
                                                    <div className="font-medium">
                                                        {card.month}/{card.year}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="opacity-60 text-xs">CVV</div>
                                                    <div className="font-medium">{card.cvv}</div>
                                                </div>
                                            </div>

                                            {/* Raw format at bottom */}
                                            <div className="mt-3 pt-3 border-t border-white/20">
                                                <div className="text-xs opacity-60 mb-1">Raw Format:</div>
                                                <div className="font-mono text-xs bg-black/20 p-2 rounded select-all">
                                                    {card.formatted}
                                                </div>
                                            </div>

                                            {/* Individual export options */}
                                            <div className="mt-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 px-2 text-xs text-white hover:bg-white/20"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        copyToClipboard(
                                                            exportCardData(card, "csv"),
                                                            "CSV data"
                                                        );
                                                    }}
                                                >
                                                    CSV
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 px-2 text-xs text-white hover:bg-white/20"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        copyToClipboard(
                                                            exportCardData(card, "json"),
                                                            "JSON data"
                                                        );
                                                    }}
                                                >
                                                    JSON
                                                </Button>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Bulk Actions */}
                                    {generatedCards.length > 1 && (
                                        <div className="flex gap-2 mt-4">
                                            <Button
                                                variant="outline"
                                                className="flex-1"
                                                onClick={() => {
                                                    const allCards = generatedCards
                                                        .map((card) => card.formatted)
                                                        .join("\n");
                                                    copyToClipboard(allCards, "All cards");
                                                }}
                                            >
                                                <Copy className="h-4 w-4 mr-2" />
                                                Copy All Raw
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="flex-1"
                                                onClick={() => {
                                                    const allCards = generatedCards
                                                        .map((card) => exportCardData(card, exportFormat))
                                                        .join("\n");
                                                    copyToClipboard(allCards, `All cards (${exportFormat})`);
                                                }}
                                            >
                                                <FileDown className="h-4 w-4 mr-2" />
                                                Copy All ({exportFormat.toUpperCase()})
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Enhanced Footer */}
                <div className="mt-12 text-center text-sm text-muted-foreground">
                    <div className="flex flex-wrap justify-center gap-4 mb-2">
                        <span>✅ Luhn Algorithm Validation</span>
                        <span>🎯 Multiple Card Types</span>
                        <span>🔀 Enhanced Wildcards</span>
                        <span>📊 Multiple Export Formats</span>
                    </div>
                    <p>
                        Built with Next.js • Advanced BIN Generation •
                        <a
                            href="https://github.com"
                            className="text-primary hover:underline ml-1"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            View Source
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
