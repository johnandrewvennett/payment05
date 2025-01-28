const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const stripe = require('stripe')('sk_test_51QkE43C1UqQhFhw4GwzGkztdXtUt4kwHfmvNecNVtoiOxZc0BQMWHxYqcrnAEDk7c9CT56tOZBRW8V6Tc6Owv7U000drZOHsgu'); // Replace with your Stripe secret key

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// HTML Form
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="icon" href="favicon.ico" type="image/x-icon">
        <title>Payment Form</title>
    </head>
    <body>
        <h1>Payment Form</h1>
            <form action="/charge" method="POST">
                <label for="cardNumber">Card Number:</label><br>
                <input type="text" id="cardNumber" name="cardNumber" required><br><br>

                <label for="expMonth">Expiry Month (MM):</label><br>
                <input type="text" id="expMonth" name="expMonth" required><br><br>

                <label for="expYear">Expiry Year (YYYY):</label><br>
                <input type="text" id="expYear" name="expYear" required><br><br>

                <label for="cvc">CVC:</label><br>
                <input type="text" id="cvc" name="cvc" required><br><br>

                <button type="submit">Pay $50.00</button>
            </form>
        </body>
        </html>
    `);
});

// Handle Payment
app.post('/charge', async (req, res) => {
    const { cardNumber, expMonth, expYear, cvc } = req.body;

    try {
    const paymentMethod = await stripe.paymentMethods.create({
        type: 'card',
        card: {
            number: cardNumber,
            exp_month: expMonth,
            exp_year: expYear,
            cvc: cvc,
        },
    });

    await stripe.paymentIntents.create({
        amount: 5000, // Amount in cents (e.g., $50.00)
        currency: 'usd',
        payment_method: paymentMethod.id,
        confirm: true,
    });

    res.redirect('/success');
    } catch (error) {
        console.error('Payment Error:', error);
        res.redirect('/error');
    }
});

// Success Page
app.get('/success', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Payment Successful</title>
            </head>
            <body>
                <h1>Payment Successful!</h1>
                <p>Thank you for your payment.</p>
            </body>
        </html>
    `);
});

// Error Page
app.get('/error', (req, res) => {
    res.send(`
        <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Payment Failed</title>
            </head>
            <body>
                <h1>Payment Failed</h1>
                <p>Something went wrong. Please try again.</p>
            </body>
        </html>
    `);
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
