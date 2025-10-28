export const quotes = [
    "Everyone's dream can come true if you just stick to it and work hard. - Serena Williams",
    "The body achieves what the minde believes - Napolean Hill",
    "The only bad workout is the one that didn't happen - Unknown",
    "Keep working even if no one is watching - Alex Morgan",
    "Set your goals high and don't stop till you get there. - Bo Jackson",
    "A year from now you may wish you had started today - Karen Lamb",
    "You’ve survived 100 percent of your worst days. — Robin Arzón",
    "The hardest part is over. You showed up. - Jess Sims",
    "The pain you feel today will show itself as strength tomorrow. - Tunde Oyeneyin"
];

//pick one random quote each day for motivation 

export function getRandomQuote(){
    return quotes[Math.floor(Math.random() * quotes.length)];
}