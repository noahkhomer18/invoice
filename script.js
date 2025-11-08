// Initialize date fields
document.addEventListener('DOMContentLoaded', function() {
    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(dueDate.getDate() + 30); // Default to 30 days from today
    
    document.getElementById('invoice-date').valueAsDate = today;
    document.getElementById('due-date').valueAsDate = dueDate;
    
    // Add first item
    addItem();
    
    // Load saved company info
    loadSavedCompanyInfo();
});

let itemCounter = 0;

function addItem() {
    const container = document.getElementById('items-container');
    
    // Create table if it doesn't exist
    if (!container.querySelector('.items-table')) {
        const table = document.createElement('table');
        table.className = 'items-table';
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Description</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                    <th class="item-actions"></th>
                </tr>
            </thead>
            <tbody id="items-tbody"></tbody>
        `;
        container.appendChild(table);
    }
    
    const tbody = document.getElementById('items-tbody');
    const row = document.createElement('tr');
    row.id = `item-${itemCounter}`;
    
    row.innerHTML = `
        <td class="item-description">
            <input type="text" placeholder="Item description" onchange="updateItemTotal(${itemCounter})">
        </td>
        <td class="item-quantity">
            <input type="number" step="0.01" min="0" value="1" placeholder="Qty" onchange="updateItemTotal(${itemCounter})">
        </td>
        <td class="item-price">
            <input type="number" step="0.01" min="0" value="0" placeholder="0.00" onchange="updateItemTotal(${itemCounter})">
        </td>
        <td class="item-total">
            <span class="item-total-value">$0.00</span>
        </td>
        <td class="item-actions">
            <button type="button" class="btn-remove" onclick="removeItem(${itemCounter})">Remove</button>
        </td>
    `;
    
    tbody.appendChild(row);
    itemCounter++;
    calculateTotals();
}

function removeItem(id) {
    const row = document.getElementById(`item-${id}`);
    if (row) {
        row.remove();
        calculateTotals();
    }
}

function updateItemTotal(id) {
    const row = document.getElementById(`item-${id}`);
    if (!row) return;
    
    const quantity = parseFloat(row.querySelector('.item-quantity input').value) || 0;
    const price = parseFloat(row.querySelector('.item-price input').value) || 0;
    const total = quantity * price;
    
    row.querySelector('.item-total-value').textContent = '$' + total.toFixed(2);
    calculateTotals();
}

function calculateTotals() {
    const rows = document.querySelectorAll('#items-tbody tr');
    let subtotal = 0;
    
    rows.forEach(row => {
        const quantity = parseFloat(row.querySelector('.item-quantity input').value) || 0;
        const price = parseFloat(row.querySelector('.item-price input').value) || 0;
        subtotal += quantity * price;
    });
    
    const taxRate = parseFloat(document.getElementById('tax-rate').value) || 0;
    const discount = parseFloat(document.getElementById('discount-amount').value) || 0;
    
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount - discount;
    
    document.getElementById('subtotal').textContent = '$' + subtotal.toFixed(2);
    document.getElementById('tax-amount').textContent = '$' + taxAmount.toFixed(2);
    document.getElementById('discount-display').textContent = '-$' + discount.toFixed(2);
    document.getElementById('total').textContent = '$' + total.toFixed(2);
    
    // Show/hide tax and discount rows
    document.getElementById('tax-row').style.display = taxRate > 0 ? 'flex' : 'none';
    document.getElementById('discount-row').style.display = discount > 0 ? 'flex' : 'none';
}

function generateInvoice() {
    // Validate required fields
    const companyName = document.getElementById('company-name').value;
    const customerName = document.getElementById('customer-name').value;
    const invoiceNumber = document.getElementById('invoice-number').value;
    
    if (!companyName || !customerName || !invoiceNumber) {
        alert('Please fill in Company Name, Customer Name, and Invoice Number');
        return;
    }
    
    // Check if there are items
    const rows = document.querySelectorAll('#items-tbody tr');
    if (rows.length === 0) {
        alert('Please add at least one item to the invoice');
        return;
    }
    
    // Build invoice HTML
    const invoiceHTML = buildInvoiceHTML();
    
    // Display preview
    document.getElementById('invoice-content').innerHTML = invoiceHTML;
    document.getElementById('invoice-preview').style.display = 'block';
    document.getElementById('invoice-preview').scrollIntoView({ behavior: 'smooth' });
}

function buildInvoiceHTML() {
    const companyName = document.getElementById('company-name').value || 'Your Company';
    const companyEmail = document.getElementById('company-email').value || '';
    const companyPhone = document.getElementById('company-phone').value || '';
    const companyWebsite = document.getElementById('company-website').value || '';
    const companyAddress = document.getElementById('company-address').value || '';
    
    const customerName = document.getElementById('customer-name').value || 'Customer';
    const customerEmail = document.getElementById('customer-email').value || '';
    const customerAddress = document.getElementById('customer-address').value || '';
    
    const invoiceNumber = document.getElementById('invoice-number').value || 'INV-001';
    const invoiceDate = document.getElementById('invoice-date').value;
    const dueDate = document.getElementById('due-date').value;
    const paymentTerms = document.getElementById('payment-terms').value || 'Net 30';
    const notes = document.getElementById('notes').value || '';
    
    const dateObj = invoiceDate ? new Date(invoiceDate) : new Date();
    const dueDateObj = dueDate ? new Date(dueDate) : new Date();
    
    // Build items table
    let itemsHTML = '';
    const rows = document.querySelectorAll('#items-tbody tr');
    rows.forEach(row => {
        const description = row.querySelector('.item-description input').value || 'Item';
        const quantity = parseFloat(row.querySelector('.item-quantity input').value) || 0;
        const price = parseFloat(row.querySelector('.item-price input').value) || 0;
        const total = quantity * price;
        
        itemsHTML += `
            <tr>
                <td>${description}</td>
                <td>${quantity.toFixed(2)}</td>
                <td>$${price.toFixed(2)}</td>
                <td>$${total.toFixed(2)}</td>
            </tr>
        `;
    });
    
    // Calculate totals
    const subtotal = parseFloat(document.getElementById('subtotal').textContent.replace('$', '')) || 0;
    const taxRate = parseFloat(document.getElementById('tax-rate').value) || 0;
    const discount = parseFloat(document.getElementById('discount-amount').value) || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount - discount;
    
    return `
        <div class="invoice-header">
            <div class="invoice-company">
                <h2>${companyName}</h2>
                ${companyAddress ? `<p>${companyAddress.replace(/\n/g, '<br>')}</p>` : ''}
                ${companyPhone ? `<p>Phone: ${companyPhone}</p>` : ''}
                ${companyEmail ? `<p>Email: ${companyEmail}</p>` : ''}
                ${companyWebsite ? `<p>Website: ${companyWebsite}</p>` : ''}
            </div>
            <div class="invoice-details">
                <h3>INVOICE</h3>
                <p><strong>Invoice #:</strong> ${invoiceNumber}</p>
                <p><strong>Date:</strong> ${dateObj.toLocaleDateString()}</p>
                <p><strong>Due Date:</strong> ${dueDateObj.toLocaleDateString()}</p>
                <p><strong>Terms:</strong> ${paymentTerms}</p>
            </div>
        </div>
        
        <div class="invoice-bill-to">
            <h3>Bill To:</h3>
            <p><strong>${customerName}</strong></p>
            ${customerEmail ? `<p>${customerEmail}</p>` : ''}
            ${customerAddress ? `<p>${customerAddress.replace(/\n/g, '<br>')}</p>` : ''}
        </div>
        
        <table class="invoice-items-table">
            <thead>
                <tr>
                    <th>Description</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHTML}
            </tbody>
        </table>
        
        <div class="invoice-totals">
            <table>
                <tr>
                    <td>Subtotal:</td>
                    <td>$${subtotal.toFixed(2)}</td>
                </tr>
                ${taxRate > 0 ? `
                <tr>
                    <td>Tax (${taxRate}%):</td>
                    <td>$${taxAmount.toFixed(2)}</td>
                </tr>
                ` : ''}
                ${discount > 0 ? `
                <tr>
                    <td>Discount:</td>
                    <td>-$${discount.toFixed(2)}</td>
                </tr>
                ` : ''}
                <tr class="total-row">
                    <td><strong>Total:</strong></td>
                    <td><strong>$${total.toFixed(2)}</strong></td>
                </tr>
            </table>
        </div>
        
        ${notes ? `
        <div class="invoice-notes">
            <h3>Notes:</h3>
            <p>${notes.replace(/\n/g, '<br>')}</p>
        </div>
        ` : ''}
    `;
}

function printInvoice() {
    if (document.getElementById('invoice-preview').style.display === 'none') {
        generateInvoice();
        setTimeout(() => window.print(), 500);
    } else {
        window.print();
    }
}

function downloadPDF() {
    // Simple PDF generation using browser print
    generateInvoice();
    setTimeout(() => {
        window.print();
    }, 500);
}

function closePreview() {
    document.getElementById('invoice-preview').style.display = 'none';
}

function saveInvoice() {
    const invoiceData = {
        company: {
            name: document.getElementById('company-name').value,
            email: document.getElementById('company-email').value,
            phone: document.getElementById('company-phone').value,
            website: document.getElementById('company-website').value,
            address: document.getElementById('company-address').value
        },
        customer: {
            name: document.getElementById('customer-name').value,
            email: document.getElementById('customer-email').value,
            address: document.getElementById('customer-address').value
        },
        invoice: {
            number: document.getElementById('invoice-number').value,
            date: document.getElementById('invoice-date').value,
            dueDate: document.getElementById('due-date').value,
            paymentTerms: document.getElementById('payment-terms').value
        },
        items: [],
        totals: {
            subtotal: parseFloat(document.getElementById('subtotal').textContent.replace('$', '')) || 0,
            taxRate: parseFloat(document.getElementById('tax-rate').value) || 0,
            discount: parseFloat(document.getElementById('discount-amount').value) || 0,
            total: parseFloat(document.getElementById('total').textContent.replace('$', '')) || 0
        },
        notes: document.getElementById('notes').value
    };
    
    // Get items
    const rows = document.querySelectorAll('#items-tbody tr');
    rows.forEach(row => {
        invoiceData.items.push({
            description: row.querySelector('.item-description input').value,
            quantity: parseFloat(row.querySelector('.item-quantity input').value) || 0,
            price: parseFloat(row.querySelector('.item-price input').value) || 0
        });
    });
    
    // Save to localStorage
    const savedInvoices = JSON.parse(localStorage.getItem('savedInvoices')) || [];
    savedInvoices.push({
        ...invoiceData,
        savedAt: new Date().toISOString()
    });
    localStorage.setItem('savedInvoices', JSON.stringify(savedInvoices));
    
    // Save company info for future use
    if (invoiceData.company.name) {
        localStorage.setItem('savedCompanyInfo', JSON.stringify(invoiceData.company));
    }
    
    alert('Invoice saved successfully!');
}

function loadSavedCompanyInfo() {
    const saved = localStorage.getItem('savedCompanyInfo');
    if (saved) {
        const companyInfo = JSON.parse(saved);
        document.getElementById('company-name').value = companyInfo.name || '';
        document.getElementById('company-email').value = companyInfo.email || '';
        document.getElementById('company-phone').value = companyInfo.phone || '';
        document.getElementById('company-website').value = companyInfo.website || '';
        document.getElementById('company-address').value = companyInfo.address || '';
    }
}

function clearForm() {
    if (confirm('Are you sure you want to clear all fields? This cannot be undone.')) {
        document.querySelectorAll('input, textarea').forEach(input => {
            if (input.type !== 'date' || input.id === 'invoice-date' || input.id === 'due-date') {
                if (input.id === 'invoice-date') {
                    input.valueAsDate = new Date();
                } else if (input.id === 'due-date') {
                    const dueDate = new Date();
                    dueDate.setDate(dueDate.getDate() + 30);
                    input.valueAsDate = dueDate;
                } else if (input.id === 'tax-rate') {
                    input.value = 0;
                } else if (input.id === 'discount-amount') {
                    input.value = 0;
                } else if (input.id === 'payment-terms') {
                    input.value = 'Net 30';
                } else {
                    input.value = '';
                }
            }
        });
        
        // Clear items
        document.getElementById('items-container').innerHTML = '';
        itemCounter = 0;
        addItem();
        calculateTotals();
        
        // Close preview
        document.getElementById('invoice-preview').style.display = 'none';
    }
}

