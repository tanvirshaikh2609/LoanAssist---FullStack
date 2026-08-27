from django.core.management.base import BaseCommand
from loans.models import Bank
from cards.models import CreditCard


class Command(BaseCommand):
    help = 'Seeds realistic Indian banking and credit card master data into PostgreSQL.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Starting Master Data Seeding..."))

        # 1. Seed Banks (15 Major Indian Bank Offerings)
        banks_data = [
            {
                "bank_name": "State Bank of India (SBI)",
                "loan_type": "home",
                "interest_rate": "8.50",
                "processing_fee": "5000.00",
                "minimum_income": "30000.00",
                "minimum_credit_score": 700,
                "maximum_loan_amount": "10000000.00",
                "website": "https://www.onlinesbi.sbi/",
                "logo": "https://upload.wikimedia.org/wikipedia/commons/c/cc/SBI-logo.svg",
                "is_active": True,
            },
            {
                "bank_name": "HDFC Bank",
                "loan_type": "home",
                "interest_rate": "8.75",
                "processing_fee": "7500.00",
                "minimum_income": "40000.00",
                "minimum_credit_score": 730,
                "maximum_loan_amount": "15000000.00",
                "website": "https://www.hdfcbank.com/",
                "logo": "https://upload.wikimedia.org/wikipedia/commons/2/28/HDFC_Bank_Logo.svg",
                "is_active": True,
            },
            {
                "bank_name": "ICICI Bank",
                "loan_type": "home",
                "interest_rate": "8.70",
                "processing_fee": "6000.00",
                "minimum_income": "35000.00",
                "minimum_credit_score": 720,
                "maximum_loan_amount": "12000000.00",
                "website": "https://www.icicibank.com/",
                "logo": "https://upload.wikimedia.org/wikipedia/commons/1/12/ICICI_Bank_Logo.svg",
                "is_active": True,
            },
            {
                "bank_name": "Axis Bank",
                "loan_type": "personal",
                "interest_rate": "10.49",
                "processing_fee": "3500.00",
                "minimum_income": "25000.00",
                "minimum_credit_score": 680,
                "maximum_loan_amount": "2500000.00",
                "website": "https://www.axisbank.com/",
                "logo": "https://upload.wikimedia.org/wikipedia/commons/c/ce/Axis_Bank_logo.svg",
                "is_active": True,
            },
            {
                "bank_name": "Bank of Baroda (BOB)",
                "loan_type": "home",
                "interest_rate": "8.40",
                "processing_fee": "4000.00",
                "minimum_income": "28000.00",
                "minimum_credit_score": 700,
                "maximum_loan_amount": "10000000.00",
                "website": "https://www.bankofbaroda.in/",
                "logo": "https://upload.wikimedia.org/wikipedia/en/8/80/Bank_of_Baroda_logo.svg",
                "is_active": True,
            },
            {
                "bank_name": "Punjab National Bank (PNB)",
                "loan_type": "home",
                "interest_rate": "8.45",
                "processing_fee": "3500.00",
                "minimum_income": "25000.00",
                "minimum_credit_score": 690,
                "maximum_loan_amount": "8000000.00",
                "website": "https://www.pnbindia.in/",
                "logo": "https://upload.wikimedia.org/wikipedia/en/e/e5/Punjab_National_Bank_Logo.svg",
                "is_active": True,
            },
            {
                "bank_name": "Kotak Mahindra Bank",
                "loan_type": "personal",
                "interest_rate": "10.99",
                "processing_fee": "4500.00",
                "minimum_income": "30000.00",
                "minimum_credit_score": 710,
                "maximum_loan_amount": "4000000.00",
                "website": "https://www.kotak.com/",
                "logo": "https://upload.wikimedia.org/wikipedia/commons/f/fc/Kotak_Mahindra_Bank_logo.svg",
                "is_active": True,
            },
            {
                "bank_name": "IDFC FIRST Bank",
                "loan_type": "personal",
                "interest_rate": "10.75",
                "processing_fee": "2000.00",
                "minimum_income": "25000.00",
                "minimum_credit_score": 680,
                "maximum_loan_amount": "3000000.00",
                "website": "https://www.idfcfirstbank.com/",
                "logo": "https://upload.wikimedia.org/wikipedia/commons/d/de/IDFC_FIRST_Bank_logo.svg",
                "is_active": True,
            },
            {
                "bank_name": "Canara Bank",
                "loan_type": "education",
                "interest_rate": "8.60",
                "processing_fee": "1500.00",
                "minimum_income": "20000.00",
                "minimum_credit_score": 660,
                "maximum_loan_amount": "4000000.00",
                "website": "https://canarabank.com/",
                "logo": "https://upload.wikimedia.org/wikipedia/en/4/4c/Canara_Bank_Logo.svg",
                "is_active": True,
            },
            {
                "bank_name": "Union Bank of India",
                "loan_type": "home",
                "interest_rate": "8.35",
                "processing_fee": "3000.00",
                "minimum_income": "25000.00",
                "minimum_credit_score": 690,
                "maximum_loan_amount": "9000000.00",
                "website": "https://www.unionbankofindia.co.in/",
                "logo": "https://upload.wikimedia.org/wikipedia/en/e/e9/Union_Bank_of_India_Logo.svg",
                "is_active": True,
            },
            {
                "bank_name": "IndusInd Bank",
                "loan_type": "car",
                "interest_rate": "9.25",
                "processing_fee": "3500.00",
                "minimum_income": "35000.00",
                "minimum_credit_score": 700,
                "maximum_loan_amount": "5000000.00",
                "website": "https://www.indusind.com/",
                "logo": "https://upload.wikimedia.org/wikipedia/commons/e/ea/IndusInd_Bank_logo.svg",
                "is_active": True,
            },
            {
                "bank_name": "Yes Bank",
                "loan_type": "business",
                "interest_rate": "12.50",
                "processing_fee": "10000.00",
                "minimum_income": "60000.00",
                "minimum_credit_score": 720,
                "maximum_loan_amount": "20000000.00",
                "website": "https://www.yesbank.in/",
                "logo": "https://upload.wikimedia.org/wikipedia/commons/4/4b/Yes_Bank_SVG_Logo.svg",
                "is_active": True,
            },
            {
                "bank_name": "Federal Bank",
                "loan_type": "home",
                "interest_rate": "8.80",
                "processing_fee": "4500.00",
                "minimum_income": "30000.00",
                "minimum_credit_score": 700,
                "maximum_loan_amount": "10000000.00",
                "website": "https://www.federalbank.co.in/",
                "logo": "https://upload.wikimedia.org/wikipedia/en/d/dc/Federal_Bank_Logo.svg",
                "is_active": True,
            },
            {
                "bank_name": "Indian Bank",
                "loan_type": "education",
                "interest_rate": "8.55",
                "processing_fee": "1000.00",
                "minimum_income": "20000.00",
                "minimum_credit_score": 650,
                "maximum_loan_amount": "3000000.00",
                "website": "https://www.indianbank.in/",
                "logo": "https://upload.wikimedia.org/wikipedia/en/e/e0/Indian_Bank_Logo.svg",
                "is_active": True,
            },
            {
                "bank_name": "Bank of India (BOI)",
                "loan_type": "home",
                "interest_rate": "8.40",
                "processing_fee": "3000.00",
                "minimum_income": "25000.00",
                "minimum_credit_score": 690,
                "maximum_loan_amount": "10000000.00",
                "website": "https://bankofindia.co.in/",
                "logo": "https://upload.wikimedia.org/wikipedia/en/d/da/Bank_of_India_logo.svg",
                "is_active": True,
            },
        ]

        bank_count = 0
        for b in banks_data:
            Bank.objects.update_or_create(
                bank_name=b["bank_name"],
                loan_type=b["loan_type"],
                defaults=b
            )
            bank_count += 1

        self.stdout.write(self.style.SUCCESS(f"Successfully seeded/updated {bank_count} Bank offerings."))

        # 2. Seed Credit Cards (19 Realistic Indian Credit Cards)
        cards_data = [
            {
                "bank_name": "HDFC Bank",
                "card_name": "Regalia Gold Credit Card",
                "annual_fee": "2500.00",
                "joining_fee": "2500.00",
                "minimum_income": "1000000.00",
                "minimum_credit_score": 750,
                "reward_type": "Reward Points & Lounge Access",
                "category": "travel",
                "benefits": [
                    "Complimentary Club Vistara Silver Tier and MMT Black Elite Membership",
                    "12 complimentary domestic airport lounge visits per year",
                    "4 reward points for every INR 150 spent"
                ],
                "image": "https://www.hdfcbank.com/content/api/contentstream-id/723fb80a-2dde-42a3-9793-7ae1be57c87f/652f1e40-69bf-4f27-abde-0ee91f2479e0",
                "is_active": True,
            },
            {
                "bank_name": "HDFC Bank",
                "card_name": "Millennia Credit Card",
                "annual_fee": "1000.00",
                "joining_fee": "1000.00",
                "minimum_income": "420000.00",
                "minimum_credit_score": 710,
                "reward_type": "Cashback",
                "category": "cashback",
                "benefits": [
                    "5% Cashback on Amazon, Flipkart, Swiggy, Zomato, BookMyShow",
                    "1% Cashback on all other offline and online spends",
                    "Complimentary domestic lounge access once per quarter"
                ],
                "image": "https://www.hdfcbank.com/content/api/contentstream-id/723fb80a-2dde-42a3-9793-7ae1be57c87f/fc4d26da-b016-419b-a010-482a1762c938",
                "is_active": True,
            },
            {
                "bank_name": "State Bank of India (SBI)",
                "card_name": "SimplyCLICK SBI Card",
                "annual_fee": "499.00",
                "joining_fee": "499.00",
                "minimum_income": "300000.00",
                "minimum_credit_score": 680,
                "reward_type": "Online Shopping Points",
                "category": "rewards",
                "benefits": [
                    "10X Reward Points on exclusive partners (Amazon, Apollo247, BookMyShow, Cleartrip)",
                    "5X Reward Points on all other online shopping spends",
                    "Annual fee reversal on spends of INR 100,000 in a year"
                ],
                "image": "https://www.sbicard.com/sbi-card-en/assets/media/images/personal/credit-cards/shopping/simplyclick-sbi-card.png",
                "is_active": True,
            },
            {
                "bank_name": "State Bank of India (SBI)",
                "card_name": "SBI Card ELITE",
                "annual_fee": "4999.00",
                "joining_fee": "4999.00",
                "minimum_income": "1200000.00",
                "minimum_credit_score": 760,
                "reward_type": "Movie Tickets & Milestones",
                "category": "premium",
                "benefits": [
                    "Welcome gift voucher worth INR 5,000",
                    "Free movie tickets worth INR 6,000 every year",
                    "Complimentary Trident Privilege Red Tier membership and Priority Pass lounge access"
                ],
                "image": "https://www.sbicard.com/sbi-card-en/assets/media/images/personal/credit-cards/lifestyle/sbi-card-elite.png",
                "is_active": True,
            },
            {
                "bank_name": "ICICI Bank",
                "card_name": "Amazon Pay ICICI Credit Card",
                "annual_fee": "0.00",
                "joining_fee": "0.00",
                "minimum_income": "300000.00",
                "minimum_credit_score": 700,
                "reward_type": "Direct Amazon Pay Cashback",
                "category": "cashback",
                "benefits": [
                    "Lifetime Free Credit Card with zero joining or annual fees",
                    "5% cashback on Amazon.in for Prime members (3% for non-Prime)",
                    "2% cashback on 100+ partner merchants and 1% on all other transactions"
                ],
                "image": "https://www.icicibank.com/content/dam/icicibank/india/managed-assets/images/personal-banking/cards/credit-card/amazon-pay-cc/amazon-pay-card.png",
                "is_active": True,
            },
            {
                "bank_name": "ICICI Bank",
                "card_name": "Sapphiro Credit Card",
                "annual_fee": "3500.00",
                "joining_fee": "6500.00",
                "minimum_income": "1500000.00",
                "minimum_credit_score": 760,
                "reward_type": "Golf & Travel Lounge",
                "category": "premium",
                "benefits": [
                    "Complimentary international and domestic airport lounge access",
                    "Complimentary rounds of golf every month at premium courses",
                    "Buy 1 get 1 free movie ticket through BookMyShow twice a month"
                ],
                "image": "https://www.icicibank.com/content/dam/icicibank/india/managed-assets/images/personal-banking/cards/credit-card/sapphiro/sapphiro-card.png",
                "is_active": True,
            },
            {
                "bank_name": "Axis Bank",
                "card_name": "Flipkart Axis Bank Credit Card",
                "annual_fee": "500.00",
                "joining_fee": "500.00",
                "minimum_income": "300000.00",
                "minimum_credit_score": 700,
                "reward_type": "Direct Cashback",
                "category": "cashback",
                "benefits": [
                    "5% unlimited cashback on Flipkart",
                    "4% cashback on preferred partners (Swiggy, Uber, PVR)",
                    "1.5% cashback on all other spends with no upper limit"
                ],
                "image": "https://www.axisbank.com/images/default-source/progress-with-us_new/flipkart-axis-bank-credit-card.jpg",
                "is_active": True,
            },
            {
                "bank_name": "Axis Bank",
                "card_name": "Atlas Credit Card",
                "annual_fee": "5000.00",
                "joining_fee": "5000.00",
                "minimum_income": "1200000.00",
                "minimum_credit_score": 750,
                "reward_type": "EDGE Miles & Airline Transfer",
                "category": "travel",
                "benefits": [
                    "Earn 5 EDGE Miles per INR 100 on travel bookings",
                    "1:2 transfer ratio to major global frequent flyer and hotel loyalty programs",
                    "Tiered milestone bonuses and complimentary international lounge visits"
                ],
                "image": "https://www.axisbank.com/images/default-source/progress-with-us_new/atlas-credit-card.jpg",
                "is_active": True,
            },
            {
                "bank_name": "Kotak Mahindra Bank",
                "card_name": "Zen Signature Credit Card",
                "annual_fee": "1500.00",
                "joining_fee": "1500.00",
                "minimum_income": "480000.00",
                "minimum_credit_score": 720,
                "reward_type": "Zen Points & Shopping",
                "category": "rewards",
                "benefits": [
                    "15 Zen Points on every INR 150 spent on apparel and lifestyle",
                    "Complimentary Priority Pass membership with international lounge visits",
                    "1% fuel surcharge waiver across India"
                ],
                "image": "https://www.kotak.com/content/dam/Kotak/cards/credit-cards/zen-signature-credit-card/zen-signature-card-image.png",
                "is_active": True,
            },
            {
                "bank_name": "IDFC FIRST Bank",
                "card_name": "FIRST Millennia Credit Card",
                "annual_fee": "0.00",
                "joining_fee": "0.00",
                "minimum_income": "300000.00",
                "minimum_credit_score": 680,
                "reward_type": "Lifetime Free Never Expiring Points",
                "category": "student",
                "benefits": [
                    "Lifetime Free credit card with zero annual and joining fee",
                    "10X Reward Points on incremental spends above INR 20,000 per month",
                    "Low interest rates starting at 9% per annum and zero interest on ATM cash withdrawals for 48 days"
                ],
                "image": "https://www.idfcfirstbank.com/content/dam/IDFCFirstBank/images/cards/first-millennia-credit-card.png",
                "is_active": True,
            },
            {
                "bank_name": "IDFC FIRST Bank",
                "card_name": "FIRST Select Credit Card",
                "annual_fee": "0.00",
                "joining_fee": "0.00",
                "minimum_income": "1000000.00",
                "minimum_credit_score": 740,
                "reward_type": "Lounge & Movie Offers",
                "category": "travel",
                "benefits": [
                    "Lifetime free premium card with complimentary domestic airport and railway lounge access",
                    "Buy one get one free movie ticket offer up to INR 250 twice a month",
                    "Comprehensive travel insurance and air accident cover"
                ],
                "image": "https://www.idfcfirstbank.com/content/dam/IDFCFirstBank/images/cards/first-select-credit-card.png",
                "is_active": True,
            },
            {
                "bank_name": "Bank of Baroda (BOB)",
                "card_name": "Eterna Credit Card",
                "annual_fee": "2499.00",
                "joining_fee": "2499.00",
                "minimum_income": "900000.00",
                "minimum_credit_score": 730,
                "reward_type": "Travel & Dining Reward Points",
                "category": "premium",
                "benefits": [
                    "15 reward points per INR 100 spent on online shopping, travel, and dining",
                    "Unlimited complimentary domestic airport lounge access",
                    "Free FitPass Pro membership"
                ],
                "image": "https://www.bobfinancial.com/images/eterna_card.png",
                "is_active": True,
            },
            {
                "bank_name": "IndusInd Bank",
                "card_name": "Legend Credit Card",
                "annual_fee": "0.00",
                "joining_fee": "0.00",
                "minimum_income": "600000.00",
                "minimum_credit_score": 720,
                "reward_type": "Weekend Multiplier Points",
                "category": "rewards",
                "benefits": [
                    "2X Reward Points on weekend shopping",
                    "Lifetime free credit card offering complimentary Priority Pass membership",
                    "1.8% low forex markup on international transactions"
                ],
                "image": "https://www.indusind.com/content/dam/indusind-corporate/card/legend-credit-card.png",
                "is_active": True,
            },
            {
                "bank_name": "Canara Bank",
                "card_name": "Standard Credit Card",
                "annual_fee": "250.00",
                "joining_fee": "0.00",
                "minimum_income": "240000.00",
                "minimum_credit_score": 660,
                "reward_type": "Utility & Shopping Points",
                "category": "rewards",
                "benefits": [
                    "Affordable entry-level card with minimal annual fee",
                    "2 reward points for every INR 100 spent",
                    "Complimentary accident insurance coverage up to INR 2 Lakhs"
                ],
                "image": "https://canarabank.com/media/card-images/standard-card.png",
                "is_active": True,
            },
            {
                "bank_name": "Punjab National Bank (PNB)",
                "card_name": "RuPay Select Credit Card",
                "annual_fee": "500.00",
                "joining_fee": "500.00",
                "minimum_income": "350000.00",
                "minimum_credit_score": 680,
                "reward_type": "Wellness & Spa Benefits",
                "category": "rewards",
                "benefits": [
                    "Complimentary health checkups and gym/spa sessions under RuPay Select program",
                    "Complimentary domestic and international lounge access",
                    "Cashback on utility bills and merchant partner offers"
                ],
                "image": "https://pnbcard.in/images/rupay-select-card.png",
                "is_active": True,
            },
            {
                "bank_name": "Union Bank of India",
                "card_name": "Platinum RuPay Credit Card",
                "annual_fee": "299.00",
                "joining_fee": "0.00",
                "minimum_income": "250000.00",
                "minimum_credit_score": 670,
                "reward_type": "RuPay Platinum Cashback",
                "category": "cashback",
                "benefits": [
                    "Cashback on utility bill payments and fuel surcharge waivers",
                    "Complimentary domestic airport lounge access under RuPay program",
                    "24/7 personal concierge services"
                ],
                "image": "https://www.unionbankofindia.co.in/images/platinum-rupay-card.png",
                "is_active": True,
            },
            {
                "bank_name": "State Bank of India (SBI)",
                "card_name": "SimplySAVE SBI Card",
                "annual_fee": "499.00",
                "joining_fee": "499.00",
                "minimum_income": "280000.00",
                "minimum_credit_score": 680,
                "reward_type": "Dining & Grocery Savings",
                "category": "cashback",
                "benefits": [
                    "10X Reward Points on dining, movies, departmental stores, and grocery spends",
                    "1% fuel surcharge waiver across all petrol pumps in India",
                    "Annual fee reversal on spends of INR 100,000 or more"
                ],
                "image": "https://www.sbicard.com/sbi-card-en/assets/media/images/personal/credit-cards/shopping/simplysave-sbi-card.png",
                "is_active": True,
            },
            {
                "bank_name": "HDFC Bank",
                "card_name": "Infinia Metal Edition",
                "annual_fee": "12500.00",
                "joining_fee": "12500.00",
                "minimum_income": "3600000.00",
                "minimum_credit_score": 780,
                "reward_type": "Ultra Luxury Global Rewards",
                "category": "premium",
                "benefits": [
                    "Unlimited international lounge access for primary and add-on cardholders via Priority Pass",
                    "Unlimited golf coaching and games at leading courses in India and worldwide",
                    "5 reward points per INR 150 spent with 10X multiplier on SmartBuy flights and hotels"
                ],
                "image": "https://www.hdfcbank.com/content/api/contentstream-id/723fb80a-2dde-42a3-9793-7ae1be57c87f/infinia-metal.png",
                "is_active": True,
            },
            {
                "bank_name": "Axis Bank",
                "card_name": "Magnus Credit Card",
                "annual_fee": "12500.00",
                "joining_fee": "12500.00",
                "minimum_income": "2400000.00",
                "minimum_credit_score": 760,
                "reward_type": "Luxury Travel & Concierge",
                "category": "premium",
                "benefits": [
                    "Complimentary Tata CLiQ flight voucher worth INR 10,000 on joining",
                    "Unlimited international lounge visits and 8 guest visits per year",
                    "24/7 dedicated luxury lifestyle concierge and airport meet-and-greet services"
                ],
                "image": "https://www.axisbank.com/images/default-source/progress-with-us_new/magnus-credit-card.jpg",
                "is_active": True,
            },
        ]

        card_count = 0
        for c in cards_data:
            CreditCard.objects.update_or_create(
                bank_name=c["bank_name"],
                card_name=c["card_name"],
                defaults=c
            )
            card_count += 1

        self.stdout.write(self.style.SUCCESS(f"Successfully seeded/updated {card_count} Credit Card offerings."))
        self.stdout.write(self.style.SUCCESS("Master Data Seeding Completed Successfully!"))
