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