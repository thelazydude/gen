// Luhn algorithm implementation
export function luhnCheck(cardNumber) {
    const digits = cardNumber.replace(/\D/g, "").split("").map(Number);
    let sum = 0;
    let isEven = false;

    for (let i = digits.length - 1; i >= 0; i--) {
        let digit = digits[i];

        if (isEven) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }

        sum += digit;
        isEven = !isEven;
    }

    return sum % 10 === 0;
}

// Generate a valid card number using Luhn algorithm
export function generateValidCardNumber(baseNumber) {
    // Ensure we have exactly 15 digits (16th will be check digit)
    let cardNumber = baseNumber.padEnd(15, "0").substring(0, 15);

    // Calculate check digit
    let sum = 0;
    let isEven = true; // Starting from the right, this will be the second digit

    for (let i = cardNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(cardNumber[i]);

        if (isEven) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }

        sum += digit;
        isEven = !isEven;
    }

    const checkDigit = (10 - (sum % 10)) % 10;
    return cardNumber + checkDigit;
}

// Detect card type based on BIN
export function detectCardType(cardNumber) {
    const firstDigit = cardNumber[0];
    const firstTwoDigits = cardNumber.substring(0, 2);
    const firstFourDigits = cardNumber.substring(0, 4);
    const firstSixDigits = cardNumber.substring(0, 6);

    if (firstDigit === "4") {
        return "Visa";
    } else if (
        ["51", "52", "53", "54", "55"].includes(firstTwoDigits) ||
        (parseInt(firstFourDigits) >= 2221 && parseInt(firstFourDigits) <= 2720)
    ) {
        return "Mastercard";
    } else if (["34", "37"].includes(firstTwoDigits)) {
        return "American Express";
    } else if (
        firstFourDigits === "6011" ||
        firstTwoDigits === "65" ||
        (parseInt(firstSixDigits) >= 644000 && parseInt(firstSixDigits) <= 649999)
    ) {
        return "Discover";
    } else if (["30", "36", "38"].includes(firstTwoDigits)) {
        return "Diners Club";
    } else if (firstTwoDigits === "35") {
        return "JCB";
    } else if (firstFourDigits === "5019") {
        return "Dankort";
    } else if (
        firstFourDigits === "4026" ||
        firstFourDigits === "4175" ||
        firstFourDigits === "4405" ||
        firstFourDigits === "4508" ||
        firstFourDigits === "4844" ||
        firstFourDigits === "4913" ||
        firstFourDigits === "4917"
    ) {
        return "Visa Electron";
    }

    return "Unknown";
}

// Generate random expiry date (MM/YY format)
export function generateRandomExpiry() {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    // Generate date between now and 10 years ahead
    const futureYear = currentYear + Math.floor(Math.random() * 10) + 1;
    const month = Math.floor(Math.random() * 12) + 1;

    // If it's the current year, make sure month is in the future
    const finalMonth =
        futureYear === currentYear && month <= currentMonth
            ? currentMonth + Math.floor(Math.random() * (12 - currentMonth)) + 1
            : month;

    const finalYear = finalMonth > 12 ? futureYear + 1 : futureYear;
    const adjustedMonth = finalMonth > 12 ? finalMonth - 12 : finalMonth;

    return {
        month: adjustedMonth.toString().padStart(2, "0"),
        year: finalYear.toString().slice(-2),
    };
}

// Generate CVV based on card type
export function generateCVV(cardType) {
    const isAmex = cardType === "American Express";
    const length = isAmex ? 4 : 3;

    let cvv = "";
    for (let i = 0; i < length; i++) {
        cvv += Math.floor(Math.random() * 10);
    }

    return cvv;
}

// Replace wildcards with random digits - supports *, X, x, ?, #, and _
export function fillWildcards(pattern) {
    return pattern.replace(/[\*XxQ#_?]/g, () => Math.floor(Math.random() * 10));
}

// Clean input by removing spaces and normalizing
export function cleanInput(input) {
    return input.replace(/\s+/g, "");
}

// Parse input pattern with enhanced separator support
export function parseInputPattern(input) {
    // Clean input first
    const cleanedInput = cleanInput(input);

    // Support multiple separators: |, /, :, -
    const parts = cleanedInput.split(/[\|\/:\-]/).filter((part) => part.length > 0);

    return {
        bin: parts[0] || "",
        month: parts[1] || null,
        year: parts[2] || null,
        cvv: parts[3] || null,
    };
}

// Enhanced card number validation
export function validateCardNumber(cardNumber) {
    // Remove any non-digit characters
    const cleaned = cardNumber.replace(/\D/g, "");

    // Check length (13-19 digits for most cards)
    if (cleaned.length < 13 || cleaned.length > 19) {
        return false;
    }

    return luhnCheck(cleaned);
}

// Generate complete credit card data
export function generateCreditCard(pattern) {
    const parsed = parseInputPattern(pattern);

    // Fill wildcards with random digits for card number
    let cardNumber = fillWildcards(parsed.bin);

    // Handle different card lengths
    let targetLength = 16; // Default length

    // Adjust for American Express (15 digits)
    if (cardNumber.startsWith("34") || cardNumber.startsWith("37")) {
        targetLength = 15;
    }
    // Adjust for Diners Club (14 digits)
    else if (cardNumber.startsWith("30") || cardNumber.startsWith("36") || cardNumber.startsWith("38")) {
        targetLength = 14;
    }

    // Handle insufficient digits
    if (cardNumber.length < targetLength) {
        const missingDigits = targetLength - cardNumber.length;
        for (let i = 0; i < missingDigits; i++) {
            cardNumber += Math.floor(Math.random() * 10);
        }
    }

    // Ensure exact target length
    cardNumber = cardNumber.substring(0, targetLength);

    // Generate valid card number using Luhn
    const validCardNumber = generateValidCardNumber(cardNumber.substring(0, targetLength - 1));

    // Detect card type
    const cardType = detectCardType(validCardNumber);

    // Generate or use provided expiry with wildcard support
    let month, year;
    if (parsed.month && parsed.year) {
        // Handle wildcards in month
        let processedMonth = parsed.month;
        if (/[\*XxQ#_?]/.test(processedMonth)) {
            processedMonth = fillWildcards(processedMonth);
            let monthNum = parseInt(processedMonth);
            if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
                monthNum = Math.floor(Math.random() * 12) + 1;
            }
            processedMonth = monthNum.toString().padStart(2, "0");
        }

        // Handle wildcards in year
        let processedYear = parsed.year;
        if (/[\*XxQ#_?]/.test(processedYear)) {
            processedYear = fillWildcards(processedYear);

            // Handle different year formats
            if (processedYear.length === 2) {
                const currentYear = new Date().getFullYear();
                const currentCentury = Math.floor(currentYear / 100) * 100;
                const yearNum = parseInt(processedYear);

                if (yearNum >= 0 && yearNum <= 49) {
                    processedYear = (currentCentury + yearNum).toString();
                } else {
                    processedYear = (currentCentury - 100 + yearNum).toString();
                }

                if (parseInt(processedYear) < currentYear) {
                    processedYear = (currentYear + Math.floor(Math.random() * 10)).toString();
                }
            } else if (processedYear.length === 4) {
                const currentYear = new Date().getFullYear();
                const yearNum = parseInt(processedYear);

                if (isNaN(yearNum) || yearNum < currentYear || yearNum > currentYear + 20) {
                    processedYear = (currentYear + Math.floor(Math.random() * 10)).toString();
                }
            } else {
                const currentYear = new Date().getFullYear();
                processedYear = (currentYear + Math.floor(Math.random() * 10)).toString();
            }
        }

        month = processedMonth.padStart(2, "0");
        year = processedYear.length === 4 ? processedYear.slice(-2) : processedYear.padStart(2, "0");
    } else {
        const expiry = generateRandomExpiry();
        month = expiry.month;
        year = expiry.year;
    }

    // Generate or use provided CVV with wildcard support
    let cvv;
    if (parsed.cvv) {
        let processedCvv = parsed.cvv;
        if (/[\*XxQ#_?]/.test(processedCvv)) {
            processedCvv = fillWildcards(processedCvv);

            const isAmex = cardType === "American Express";
            const expectedLength = isAmex ? 4 : 3;

            if (processedCvv.length !== expectedLength || isNaN(parseInt(processedCvv))) {
                processedCvv = generateCVV(cardType);
            }

            cvv = processedCvv;
        } else {
            cvv = processedCvv;
        }
    } else {
        cvv = generateCVV(cardType);
    }

    return {
        cardNumber: validCardNumber,
        month,
        year,
        cvv,
        cardType,
        formatted: `${validCardNumber}|${month}|${year}|${cvv}`, // No spaces in final format
    };
}

// Batch generate multiple cards
export function generateMultipleCards(pattern, count = 1) {
    const cards = [];
    for (let i = 0; i < count; i++) {
        try {
            cards.push(generateCreditCard(pattern));
        } catch (error) {
            console.error(`Error generating card ${i + 1}:`, error);
        }
    }
    return cards;
}

// Export all card data in different formats
export function exportCardData(card, format = "pipe") {
    switch (format.toLowerCase()) {
        case "pipe":
            return `${card.cardNumber}|${card.month}|${card.year}|${card.cvv}`;
        case "json":
            return JSON.stringify(card, null, 2);
        case "csv":
            return `${card.cardNumber},${card.month},${card.year},${card.cvv},${card.cardType}`;
        case "formatted":
            return `${card.cardNumber.replace(/(.{4})/g, "$1 ").trim()} ${card.month}/${card.year} ${
                card.cvv
            }`;
        default:
            return card.formatted;
    }
}
