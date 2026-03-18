# Lotto Number Generator

## Overview

This project is a web-based lottery number generator. It provides users with a set of randomly generated numbers for lottery draws. The application is designed with a clean, modern interface and is built using standard web technologies: HTML, CSS, and JavaScript.

## Style, Design, and Features

### Visual Design
*   **Layout:** A centered, clean layout that is responsive and works well on both desktop and mobile devices.
*   **Color Palette:** A vibrant color scheme is used to make the numbers visually appealing. Each number ball has a different background color.
*   **Typography:** Clear and readable fonts are used for the numbers and other text on the page.
*   **Animation:** Subtle animations are used to make the appearance of the numbers more dynamic.
*   **Iconography:** A clover icon is used in the header to symbolize luck.

### Features
*   **Random Number Generation:** Generates 6 unique random numbers between 1 and 45.
*   **Web Components:** Uses a custom HTML element (`<lotto-ball>`) to display each number, encapsulating its style and behavior.
*   **Interactive Button:** A button allows the user to generate a new set of numbers at any time.

## Current Plan

*   **Objective:** Create a lottery number generator website.
*   **Steps:**
    1.  **Modify `index.html`:** Set up the basic structure of the page, including a title, a container for the lottery balls, and a "Generate" button.
    2.  **Modify `style.css`:** Add styles for the page layout, the lottery balls, and the button to create a visually appealing design.
    3.  **Modify `main.js`:**
        *   Implement the logic for generating unique random lottery numbers.
        *   Create a `LottoBall` web component to display the numbers.
        *   Add an event listener to the button to trigger the number generation.
