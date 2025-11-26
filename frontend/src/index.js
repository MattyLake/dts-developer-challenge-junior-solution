import './index.css';

console.log('Frontend module loaded');

// Initialize form date/time handling
document.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.querySelector('input[name="dueDate"]');
    const timeInput = document.querySelector('input[name="time"]');
    const form = document.querySelector('form');
    const toast = document.getElementById('api-test');
    const toastMsg = document.getElementById('api-test-message');
    const statusPulse = document.getElementById('api-pulse');

    function showToast(message, success = true) {
        if (!toast || !toastMsg || !statusPulse) return;
        toastMsg.textContent = message;
        toast.style.display = 'flex';
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 300ms ease';
        // Pulse color
        statusPulse.className = success
            ? 'w-4 h-4 rounded-full bg-green-500 animate-pulse absolute top-2 right-2'
            : 'w-4 h-4 rounded-full bg-red-500 animate-pulse absolute top-2 right-2';

        // Fade in
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
        });

        // Fade out after 3s
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                toast.style.display = 'none';
            }, 300);
        }, 3000);
    }

    // Set today's date as the default value and minimum
    const today = new Date().toISOString().split('T')[0];
    if (dateInput) {
        dateInput.value = today;
        dateInput.min = today;
        
        // Custom validation message
        dateInput.addEventListener('input', (e) => {
            const selectedDate = new Date(e.target.value);
            const currentDate = new Date(today);
            
            if (selectedDate < currentDate) {
                e.target.setCustomValidity('Please select a future date');
            } else {
                e.target.setCustomValidity('');
            }
        });
    }

    // Form submission handler
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            // Additional validation: check if date is in the future
            const selectedDate = new Date(data.dueDate + 'T' + data.time);
            const now = new Date();
            
            if (selectedDate <= now) {
                showToast('Please select a future date and time', false);
                return;
            }

            try {
                const res = await fetch('http://localhost:3000/api/tasks', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: data.title,
                        description: data.description || null,
                        status: data.status,
                        dueDate: data.dueDate,
                        time: data.time,
                    }),
                });

                const payload = await res.json();
                if (!res.ok) {
                    showToast(payload?.error || 'Failed to save task', false);
                    return;
                }

                showToast('Task saved!', true);
                form.reset();
                if (dateInput) {
                    dateInput.value = today; // reset to today
                }
            } catch (err) {
                showToast('Network or server error while saving task', false);
                console.error(err);
            }
        });
    }
});

// Smoke test API connection on load
fetch('http://localhost:3000/api/hello')
    .then(response => response.json())
    .then(data => {
        console.log('API response:', data);
    })
    .catch(() => {
        console.error('Failed to connect to API');
    });