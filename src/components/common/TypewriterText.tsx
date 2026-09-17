import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TypewriterTextProps {
    texts: string[];
    delay?: number;
    baseText?: string;
    className?: string;
    cursorColor?: string;
    highlightClassName?: string;
}

const TypewriterText: React.FC<TypewriterTextProps> = ({
    texts,
    delay = 150,
    baseText = "",
    className = "",
    cursorColor = "bg-gold-500",
    highlightClassName = "text-gold-500 italic"
}) => {
    const [currentTextIndex, setCurrentTextIndex] = useState(0);
    const [currentText, setCurrentText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => {
            const fullText = texts[currentTextIndex];

            if (isDeleting) {
                setCurrentText(fullText.substring(0, currentText.length - 1));
            } else {
                setCurrentText(fullText.substring(0, currentText.length + 1));
            }

            if (!isDeleting && currentText === fullText) {
                setTimeout(() => setIsDeleting(true), 2000); // Wait longer before deleting
            } else if (isDeleting && currentText === '') {
                setIsDeleting(false);
                setCurrentTextIndex((prev) => (prev + 1) % texts.length);
            }
        }, isDeleting ? delay / 2 : delay);

        return () => clearTimeout(timeout);
    }, [currentText, isDeleting, currentTextIndex, texts, delay]);

    // Render text with highlighting
    const renderText = () => {
        const parts = currentText.split('*');
        return parts.map((part, index) => {
            if (index % 2 === 1) {
                return <span key={index} className={highlightClassName}>{part}</span>;
            }
            return <span key={index}>{part}</span>;
        });
    };

    return (
        <span>
            {baseText} <span className={className}>{renderText()}</span>
            <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                className={`inline-block w-[3px] h-[1em] ml-1 align-middle ${cursorColor}`}
            />
        </span>
    );
};

export default TypewriterText;
