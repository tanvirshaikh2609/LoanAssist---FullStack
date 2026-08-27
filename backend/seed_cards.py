import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from cards.models import CreditCard

CARDS_DATA = [
    {
        "bank_name": "HDFC Bank",
        "card_name": "Infinia Metal Edition",
        "annual_fee": 12500.00,
        "joining_fee": 12500.00,
        "minimum_income": 3600000.00,
        "minimum_credit_score": 780,
        "reward_type": "5x Reward Points",
        "category": "premium",
        "benefits": [
            "Unlimited airport lounge access globally for primary & add-on cardholders",
            "24/7 dedicated global concierge service",
            "Complimentary golf privileges & luxury hotel memberships",
            "5 reward points per ₹150 spent (up to 33% reward rate on SmartBuy)"
        ]
    },
    {
        "bank_name": "HDFC Bank",
        "card_name": "Magnus Credit Card",
        "annual_fee": 12500.00,
        "joining_fee": 12500.00,
        "minimum_income": 2400000.00,
        "minimum_credit_score": 750,
        "reward_type": "Edge Reward Points",
        "category": "travel",
        "benefits": [
            "Unlimited domestic lounge visits & 8 complimentary guest visits/year",
            "Complimentary flight tickets on annual spend milestones",
            "25,000 Edge points welcome gift voucher on joining",
            "Reduced 2% forex markup for international travel"
        ]
    },
    {
        "bank_name": "HDFC Bank",
        "card_name": "Regalia Gold Credit Card",
        "annual_fee": 2500.00,
        "joining_fee": 2500.00,
        "minimum_income": 1200000.00,
        "minimum_credit_score": 720,
        "reward_type": "Gold Reward Points",
        "category": "rewards",
        "benefits": [
            "12 complimentary domestic lounge visits per calendar year",
            "6 international lounge visits with Priority Pass membership",
            "Milestone vouchers worth ₹5,000 on ₹5 Lakh annual spend",
            "Complimentary Club Marriott membership & dining discounts"
        ]
    },
    {
        "bank_name": "HDFC Bank",
        "card_name": "Millennia Credit Card",
        "annual_fee": 1000.00,
        "joining_fee": 1000.00,
        "minimum_income": 360000.00,
        "minimum_credit_score": 700,
        "reward_type": "Cashback",
        "category": "cashback",
        "benefits": [
            "5% cashback on Amazon, Flipkart, Swiggy, Zomato, BookMyShow",
            "1% cashback on all other online & offline wallet/POS spends",
            "1,000 CashPoints on joining and annual fee waiver on ₹1 Lakh spend",
            "1% fuel surcharge waiver across all fuel stations in India"
        ]
    },
    {
        "bank_name": "Axis Bank",
        "card_name": "Atlas Credit Card",
        "annual_fee": 5000.00,
        "joining_fee": 5000.00,
        "minimum_income": 1200000.00,
        "minimum_credit_score": 740,
        "reward_type": "Edge Miles",
        "category": "travel",
        "benefits": [
            "5,000 Edge Miles welcome gift on first three transactions",
            "Tiered airport lounge access up to 18 visits/year across India",
            "5x Edge Miles on direct airline and hotel portal bookings",
            "1:2 conversion ratio with major global airline mileage partners"
        ]
    },
    {
        "bank_name": "Axis Bank",
        "card_name": "Flipkart Axis Bank Credit Card",
        "annual_fee": 500.00,
        "joining_fee": 500.00,
        "minimum_income": 300000.00,
        "minimum_credit_score": 680,
        "reward_type": "Unlimited Cashback",
        "category": "rewards",
        "benefits": [
            "5% unlimited cashback on Flipkart, Myntra & Cleartrip",
            "4% cashback on preferred partners including Swiggy, Uber, PVR",
            "1.5% unlimited cashback on all other retail expenditures",
            "4 complimentary domestic airport lounge visits per year"
        ]
    },
    {
        "bank_name": "ICICI Bank",
        "card_name": "Sapphiro Credit Card",
        "annual_fee": 3500.00,
        "joining_fee": 6500.00,
        "minimum_income": 1500000.00,
        "minimum_credit_score": 740,
        "reward_type": "PAYBACK / ICICI Rewards",
        "category": "travel",
        "benefits": [
            "Buy 1 Get 1 free movie ticket up to ₹500 twice a month on BookMyShow",
            "4 complimentary domestic airport lounge visits per quarter",
            "2 complimentary international lounge visits/year with DreamFolks pass",
            "Complimentary golf rounds and lessons per month"
        ]
    },
    {
        "bank_name": "ICICI Bank",
        "card_name": "Amazon Pay ICICI Credit Card",
        "annual_fee": 0.00,
        "joining_fee": 0.00,
        "minimum_income": 300000.00,
        "minimum_credit_score": 680,
        "reward_type": "Amazon Pay Balance",
        "category": "cashback",
        "benefits": [
            "5% unlimited cashback on Amazon.in for Amazon Prime members",
            "3% unlimited cashback on Amazon.in for non-Prime members",
            "2% cashback on 100+ partner merchants & digital recharges",
            "Lifetime Free card with zero joining and zero annual maintenance fee"
        ]
    },
    {
        "bank_name": "SBI Card",
        "card_name": "SBI Card ELITE",
        "annual_fee": 4999.00,
        "joining_fee": 4999.00,
        "minimum_income": 1200000.00,
        "minimum_credit_score": 740,
        "reward_type": "Club Vistara / Rewards",
        "category": "travel",
        "benefits": [
            "Welcome e-gift voucher worth ₹5,000 from leading lifestyle brands",
            "Free movie tickets worth ₹6,000 every year on BookMyShow",
            "6 complimentary international lounge visits/year via Priority Pass",
            "2 complimentary domestic airport lounge visits per calendar quarter"
        ]
    },
    {
        "bank_name": "SBI Card",
        "card_name": "SimplyCLICK SBI Card",
        "annual_fee": 499.00,
        "joining_fee": 499.00,
        "minimum_income": 300000.00,
        "minimum_credit_score": 680,
        "reward_type": "10x Reward Points",
        "category": "rewards",
        "benefits": [
            "10x reward points on Amazon, BookMyShow, Cleartrip, Lenskart, Netmeds",
            "5x reward points on all other online spends",
            "₹500 Amazon gift voucher on payment of joining fee",
            "Annual fee waiver on annual retail spends of ₹1,00,000"
        ]
    },
    {
        "bank_name": "SBI Card",
        "card_name": "SimplySAVE SBI Card",
        "annual_fee": 499.00,
        "joining_fee": 499.00,
        "minimum_income": 240000.00,
        "minimum_credit_score": 650,
        "reward_type": "Reward Points",
        "category": "cashback",
        "benefits": [
            "10 reward points per ₹150 on Dining, Movies, Grocery & Departmental spends",
            "1 reward point per ₹150 on all other retail spending",
            "2,000 bonus reward points on spends of ₹2,000 in first 60 days",
            "1% fuel surcharge waiver at all petrol pumps across India"
        ]
    },
    {
        "bank_name": "IDFC FIRST Bank",
        "card_name": "FIRST Select Credit Card",
        "annual_fee": 0.00,
        "joining_fee": 0.00,
        "minimum_income": 900000.00,
        "minimum_credit_score": 720,
        "reward_type": "Never-Expiring Rewards",
        "category": "rewards",
        "benefits": [
            "Lifetime Free card with zero joining fee and zero annual renewal fee",
            "4 complimentary domestic airport lounge visits per quarter",
            "Buy 1 Get 1 movie ticket offer up to ₹250 on Paytm Movies twice a month",
            "10x reward points on incremental monthly spends above ₹25,000"
        ]
    },
    {
        "bank_name": "IDFC FIRST Bank",
        "card_name": "FIRST Millennia Credit Card",
        "annual_fee": 0.00,
        "joining_fee": 0.00,
        "minimum_income": 240000.00,
        "minimum_credit_score": 650,
        "reward_type": "IDFC Reward Points",
        "category": "student",
        "benefits": [
            "Lifetime Free card tailored for young professionals & students",
            "10x reward points on incremental spends above ₹20,000/month",
            "Dynamic interest rates starting from as low as 0.75% per month",
            "Buy 1 Get 1 movie ticket offer up to ₹100 once a month on Paytm"
        ]
    },
    {
        "bank_name": "Bank of Baroda",
        "card_name": "Eterna Credit Card",
        "annual_fee": 2499.00,
        "joining_fee": 2499.00,
        "minimum_income": 1200000.00,
        "minimum_credit_score": 730,
        "reward_type": "BOB Reward Points",
        "category": "premium",
        "benefits": [
            "Unlimited complimentary domestic airport lounge access",
            "Buy 1 Get 1 free movie ticket on Paytm Movies up to ₹250",
            "3x reward points on dining, travel bookings, and international spends",
            "10,000 bonus reward points on spending ₹50,000 within first 60 days"
        ]
    },
    {
        "bank_name": "IndusInd Bank",
        "card_name": "Legend Credit Card",
        "annual_fee": 0.00,
        "joining_fee": 0.00,
        "minimum_income": 600000.00,
        "minimum_credit_score": 700,
        "reward_type": "IndusInd Rewards",
        "category": "rewards",
        "benefits": [
            "Lifetime Free premium credit card with zero recurring charges",
            "1 complimentary domestic airport lounge visit per quarter",
            "Buy 1 Get 1 free movie ticket once a month on BookMyShow",
            "1 reward point per ₹100 weekday spend, 2x points on weekend spends"
        ]
    },
    {
        "bank_name": "Kotak Mahindra Bank",
        "card_name": "Zen Signature Credit Card",
        "annual_fee": 1500.00,
        "joining_fee": 1500.00,
        "minimum_income": 600000.00,
        "minimum_credit_score": 700,
        "reward_type": "Zen Reward Points",
        "category": "rewards",
        "benefits": [
            "1,500 Zen points welcome gift on fee payment",
            "2 complimentary domestic airport lounge visits per calendar quarter",
            "5 Zen points per ₹150 on apparel, lifestyle, jewelry, dining spends",
            "Annual fee waiver on reaching ₹1.5 Lakh annual spends"
        ]
    },
    {
        "bank_name": "Punjab National Bank",
        "card_name": "RuPay Select Credit Card",
        "annual_fee": 500.00,
        "joining_fee": 500.00,
        "minimum_income": 360000.00,
        "minimum_credit_score": 680,
        "reward_type": "RuPay Perks & Cashback",
        "category": "cashback",
        "benefits": [
            "Complimentary Spa, Health Checkup, and Gym membership passes",
            "2 complimentary domestic airport lounge visits per quarter",
            "Comprehensive personal accident insurance coverage up to ₹10 Lakhs",
            "Seamless UPI linking for instant digital merchant payments"
        ]
    },
    {
        "bank_name": "Union Bank of India",
        "card_name": "Platinum RuPay Credit Card",
        "annual_fee": 0.00,
        "joining_fee": 0.00,
        "minimum_income": 180000.00,
        "minimum_credit_score": 600,
        "reward_type": "Cashback & Points",
        "category": "cashback",
        "benefits": [
            "Lifetime Free entry-level RuPay card with zero joining charges",
            "Seamless UPI QR code payments with linked bank accounts",
            "Accidental death insurance coverage up to ₹2 Lakhs",
            "Special merchant discounts and cashback offers across India"
        ]
    },
    {
        "bank_name": "Canara Bank",
        "card_name": "Standard Credit Card",
        "annual_fee": 0.00,
        "joining_fee": 0.00,
        "minimum_income": 180000.00,
        "minimum_credit_score": 600,
        "reward_type": "Canara Rewardz",
        "category": "rewards",
        "benefits": [
            "Lifetime Free credit card with zero hidden charges or annual fees",
            "Up to 50 days interest-free credit repayment cycle",
            "Complimentary accidental insurance coverage up to ₹1 Lakh",
            "Accepted at over 30 million merchant outlets and online gateways"
        ]
    }
]

def seed():
    print(f"Seeding {len(CARDS_DATA)} credit cards...")
    created_count = 0
    updated_count = 0
    for card_info in CARDS_DATA:
        obj, created = CreditCard.objects.update_or_create(
            card_name=card_info["card_name"],
            defaults=card_info
        )
        if created:
            created_count += 1
        else:
            updated_count += 1
    print(f"Done! Created: {created_count}, Updated: {updated_count}, Total active in DB: {CreditCard.objects.filter(is_active=True).count()}")

if __name__ == '__main__':
    seed()
