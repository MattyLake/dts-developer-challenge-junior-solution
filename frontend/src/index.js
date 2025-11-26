import './index.css';

// Initialize form date/time handling
document.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.querySelector('input[name="dueDate"]');
    const timeInput = document.querySelector('input[name="time"]');
    const form = document.querySelector('form');
    const toast = document.getElementById('api-test');
    const toastMsg = document.getElementById('api-test-message');
    const statusPulse = document.getElementById('api-pulse');

    // Fixed base classes applied once
    if (statusPulse) {
        statusPulse.className = 'w-4 h-4 rounded-full animate-pulse absolute top-2 right-2';
    }

    function showToast(message, success = true, details = null) {
        if (!toast || !toastMsg || !statusPulse) return;
        // Set color only (base classes remain)
        statusPulse.style.backgroundColor = success ? '#22c55e' /* green-500 */ : '#ef4444' /* red-500 */;

        // Guard against missing details
        const formatted_due_date = (details && details.due_date)
            ? String(details.due_date).split('T')[0]
            : null;

        // Compose message with optional details
        if (details && typeof details === 'object') {
            const summary = [
                details.title ? ` · Title: ${details.title}` : null,
                details.status ? `Status: ${details.status}` : null,
                details.due_date ? `Due Date: ${formatted_due_date}` : null,
                details.due_time ? `Time: ${details.due_time}` : null,
            ].filter(Boolean).join('\n · ');
            toastMsg.textContent = summary ? `${message}\n${summary}` : message;
        } else {
            toastMsg.textContent = message;
        }

        // Show and animate
        toast.style.display = 'flex';
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 300ms ease';
        requestAnimationFrame(() => { toast.style.opacity = '1'; });
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => { toast.style.display = 'none'; }, 300);
        }, 3000);
    }

    // Set today's date as the default value and minimum
    const today = new Date().toISOString().split('T')[0];
    if (dateInput) {
        dateInput.value = today;
        dateInput.min = today;

        // Custom validation message and immediate feedback
        const validateDate = (el) => {
            const val = el.value;
            if (!val) {
                el.setCustomValidity('Please select a due date');
                return false;
            }
            const selectedDate = new Date(val + 'T00:00');
            const currentDate = new Date(today + 'T00:00');
            if (selectedDate < currentDate) {
                el.setCustomValidity('Please select a future date');
                return false;
            }
            el.setCustomValidity('');
            return true;
        };

        dateInput.addEventListener('input', (e) => {
            const ok = validateDate(e.target);
            if (!ok) e.target.reportValidity();
        });

        // Show message when trying to submit with invalid date
        dateInput.addEventListener('invalid', (e) => {
            e.preventDefault();
            showToast(e.target.validationMessage || 'Invalid due date', false);
        });
    }

    // Form submission handler
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            // Native validity first
            if (dateInput && !dateInput.checkValidity()) {
                dateInput.reportValidity();
                showToast(dateInput.validationMessage || 'Invalid due date', false);
                dateInput.focus();
                return;
            }
            if (timeInput && !timeInput.value) {
                timeInput.setCustomValidity('Please select a time');
                timeInput.reportValidity();
                showToast('Please select a time', false);
                timeInput.focus();
                return;
            } else if (timeInput) {
                timeInput.setCustomValidity('');
            }

            // Additional validation: check if date is in the future
            const selectedDate = new Date(data.dueDate + 'T' + data.time);
            const now = new Date();
            
            // Re-check native validity first
            if (selectedDate <= now) {
                showToast('Please select a future date and time', false);
                if (dateInput) dateInput.focus();
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

                // Extend toast with confirmation of what was saved
                const saved = payload?.task || null;
                showToast('Task saved!', true, saved ?? {
                    title: data.title,
                    description: data.description || null,
                    status: data.status,
                    due_date: data.dueDate,
                    due_time: data.time,
                });
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