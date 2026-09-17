import { PDFDocument, rgb, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";
import { encodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";

export async function generateApplicationPDF(record: Record<string, unknown>, type: 'aid' | 'volunteer'): Promise<string> {
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([600, 800]);
    const ubuntuFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const { width, height } = page.getSize();
    let textY = height - 50;

    const drawHeader = (pg: any, currentY: number) => {
        pg.drawRectangle({
            x: 0,
            y: height - 100,
            width: width,
            height: 100,
            color: rgb(42 / 255, 26 / 255, 46 / 255), // Primary 900
        });

        pg.drawText('Al-Ihsan Relief & Empowerment', {
            x: 50,
            y: height - 40,
            size: 24,
            font: boldFont,
            color: rgb(212 / 255, 175 / 255, 55 / 255), // Gold 500
        });

        const title = type === 'volunteer' ? 'Volunteer Application Summary' : 'Aid Request Summary';
        pg.drawText(title, {
            x: 50,
            y: height - 70,
            size: 14,
            font: ubuntuFont,
            color: rgb(1, 1, 1), // White
        });

        return height - 140; // New Y
    };

    textY = drawHeader(page, textY);

    const drawRow = (label: string, value: string) => {
        if (textY < 50) {
            page = pdfDoc.addPage([600, 800]);
            textY = drawHeader(page, height - 50);
        }
        page.drawText(label + ':', { x: 50, y: textY, size: 11, font: boldFont, color: rgb(0.2, 0.2, 0.2) });
        
        // Wrap value if too long
        const maxLen = 70;
        let remaining = String(value || 'N/A');
        
        while(remaining.length > 0) {
            if (textY < 50) {
                page = pdfDoc.addPage([600, 800]);
                textY = drawHeader(page, height - 50);
            }
            const chunk = remaining.substring(0, maxLen);
            remaining = remaining.substring(maxLen);
            page.drawText(chunk, { x: 200, y: textY, size: 11, font: ubuntuFont, color: rgb(0.3, 0.3, 0.3) });
            textY -= 16;
        }
        textY -= 10;
    };

    // Filter and format object fields
    const excludeKeys = ['id', 'status', 'created_at', 'updated_at', 'photo_urls', 'video_url'];
    
    for (const [key, value] of Object.entries(record)) {
        if (excludeKeys.includes(key) || typeof value === 'object') continue;
        const cleanLabel = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        drawRow(cleanLabel, String(value));
    }

    const pdfBytes = await pdfDoc.save();
    return encodeBase64(pdfBytes);
}

export async function generateStandardPDF(title: string, bodyText: string): Promise<string> {
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([600, 800]);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const { width, height } = page.getSize();
    let textY = height - 60;

    const drawHeader = (pg: any, currentY: number) => {
        pg.drawText('Al-Ihsan Relief & Empowerment', { x: 50, y: height - 50, size: 20, font: boldFont, color: rgb(42 / 255, 26 / 255, 46 / 255) });
        pg.drawLine({ start: { x: 50, y: height - 65 }, end: { x: 550, y: height - 65 }, thickness: 2, color: rgb(212 / 255, 175 / 255, 55 / 255) });
        pg.drawText(title, { x: 50, y: height - 90, size: 16, font: boldFont, color: rgb(0, 0, 0) });
        return height - 130;
    };

    textY = drawHeader(page, textY);

    const paragraphs = bodyText.split('\n');
    
    for (const p of paragraphs) {
        if (!p.trim()) {
            textY -= 10;
            continue;
        }

        const words = p.split(' ');
        let line = '';
        
        for (const word of words) {
            if (line.length + word.length > 85) {
                if (textY < 50) {
                    page = pdfDoc.addPage([600, 800]);
                    textY = drawHeader(page, height - 50);
                }
                page.drawText(line, { x: 50, y: textY, size: 11, font: font, color: rgb(0.2, 0.2, 0.2) });
                textY -= 16;
                line = '';
            }
            line += word + ' ';
        }
        
        if (line.trim()) {
            if (textY < 50) {
                page = pdfDoc.addPage([600, 800]);
                textY = drawHeader(page, height - 50);
            }
            page.drawText(line.trim(), { x: 50, y: textY, size: 11, font: font, color: rgb(0.2, 0.2, 0.2) });
            textY -= 20; // paragraph break
        }
    }

    const pdfBytes = await pdfDoc.save();
    return encodeBase64(pdfBytes);
}
