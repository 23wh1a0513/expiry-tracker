// Quick Test Script - Run in browser console to add test items

const API_BASE = 'http://localhost:3000';

async function addTestItem(name, expiryDate) {
    try {
        const res = await fetch(`${API_BASE}/items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, expiryDate })
        });
        
        if (res.ok) {
            console.log(`✓ Added: ${name}`);
            return true;
        } else {
            const err = await res.json();
            console.error(`✗ Error adding ${name}:`, err);
            return false;
        }
    } catch (err) {
        console.error('Error:', err.message);
        return false;
    }
}

// Example test items
async function runTests() {
    console.log('🧪 Adding test items...\n');
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const tests = [
        { name: 'Milk', date: tomorrow.toISOString().split('T')[0] },
        { name: 'Bread', date: nextWeek.toISOString().split('T')[0] },
        { name: 'Yogurt', date: new Date(today.getTime() + 2*24*60*60*1000).toISOString().split('T')[0] },
        { name: 'Cheese', date: new Date(today.getTime() + 14*24*60*60*1000).toISOString().split('T')[0] },
        { name: 'Expired Juice', date: yesterday.toISOString().split('T')[0] }
    ];
    
    for (const test of tests) {
        await addTestItem(test.name, test.date);
        await new Promise(r => setTimeout(r, 500)); // Small delay
    }
    
    console.log('\n✅ Test completed! Refresh the page to see items.');
}

// Run: runTests()
