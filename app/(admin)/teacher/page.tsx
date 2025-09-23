import React from "react";

const items = [
    "Item 1",
    "Item 2",
    "Item 3",
    "Item 4",
    "Item 5",
];

export default function TestPage() {
    return (
        <main style={{ padding: "2rem" }}>
            <h1>Daftar Item</h1>
            <ul>
                {items.map((item, idx) => (
                    <li key={idx}>{item}</li>
                ))}
            </ul>
        </main>
    );
}