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
        <script src="https://js.stripe.com/v3/"></script>
        <style>
            body {
                font-family: Arial, sans-serif;
            }
            .form-container {
                max-width: 400px;
                margin: 0 auto;
            }
        </style>
    </head>
    <body>
        <div class="form-container">
            <h1>Payment Form</h1>
            <form id="payment-form">
                <p>Card #: 4242424242424242</p>
                <p>cvc #: 123</p>
                <p>Date : 10/5/2040</p>
                <p>Zip Code : 33139</p>
                <div id="card-element"></div>
                <button type="submit">Pay $50.00</button>
            </form>
            <div id="payment-errors" role="alert"></div>
        </div>
        <script>
                        const stripe = Stripe('pk_test_51QkE43C1UqQhFhw44FBwsaPxexyTd3KbAAdIkEf1eWCsBtdKk4FTQ04JQil8zGQ3BMkFTsIW34zpO4ICVGeXOdgm001REg2tXE');

            const elements = stripe.elements();
            const card = elements.create('card');
            card.mount('#card-element');

            const form = document.getElementById('payment-form');
            form.addEventListener('submit', async (event) => {
                event.preventDefault();

                const { token, error } = await stripe.createToken(card);

                if (error) {
                    const errorElement = document.getElementById('payment-errors');
                    errorElement.textContent = error.message;
                } else {
                    const response = await fetch('/charge', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ token: token.id })
                    });

                    if (response.ok) {
                        window.location.href = '/success';
                    } else {
                        window.location.href = '/error';
                    }
                }
            });
        </script>
    </body>
    </html>
    `);
});

// Handle Payment
app.post('/charge', async (req, res) => {
    const { token } = req.body;

    try {
        await stripe.paymentIntents.create({
            amount: 5000, // Amount in cents (e.g., $50.00)
            currency: 'usd',
            payment_method_data: {
                type: 'card',
                card: {
                    token: token,
                },
            },
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
