/**
 * DEMO content only. Every name, matric number and answer below is fictional and
 * clearly labelled DEMO. Never replace this with real student data.
 */
export const DEMO_GROUPS = [
  {
    group_name: 'Group A', business_name: 'Eco-Friendly Food Delivery',
    business_idea: 'A campus food-delivery service that uses reusable containers and bicycle couriers to cut single-use packaging and emissions.',
    members: [
      { name: 'Abu (DEMO)', matric_no: 'DEMO-A001', component: 'Marketing' },
      { name: 'Ali (DEMO)', matric_no: 'DEMO-A002', component: 'Product Planning' },
      { name: 'Ahmad (DEMO)', matric_no: 'DEMO-A003', component: 'Financial Planning' },
    ],
    profile: { market: 'UTHM students and staff ordering lunch and dinner on campus', competitors: 'GrabFood, foodpanda and cafeteria walk-ins', product: 'a mobile ordering app with a deposit-based reusable container scheme', price: 'RM 2 delivery fee with a RM 1 container deposit refunded on return', startup: 'RM 18,000 for bicycles, insulated bags, 600 containers and app development', revenue: 'RM 9,500 per month at 190 orders a day', breakeven: 'month 11', innovation: 'a container-return QR tracking system that rewards students with discount points' },
  },
  {
    group_name: 'Group B', business_name: 'Smart Waste Management',
    business_idea: 'Sensor-equipped campus bins that report fill levels so cleaning teams collect only when needed and recycling rates can be measured.',
    members: [
      { name: 'Siti (DEMO)', matric_no: 'DEMO-B001', component: 'Marketing' },
      { name: 'Aina (DEMO)', matric_no: 'DEMO-B002', component: 'Product Planning' },
      { name: 'Farah (DEMO)', matric_no: 'DEMO-B003', component: 'Financial Planning' },
    ],
    profile: { market: 'university facilities departments and residential colleges', competitors: 'conventional scheduled collection and imported smart-bin vendors', product: 'a low-cost ultrasonic bin sensor with a LoRaWAN gateway and a web dashboard', price: 'RM 45 per sensor per month on a subscription basis', startup: 'RM 32,000 for 120 sensors, two gateways and dashboard development', revenue: 'RM 5,400 per month from a first campus contract', breakeven: 'month 14', innovation: 'predictive collection routes generated from fill-level history' },
  },
  {
    group_name: 'Group C', business_name: 'Campus Smart Parking',
    business_idea: 'A real-time parking availability app for campus car parks using camera-based occupancy detection and a reservation feature for events.',
    members: [
      { name: 'Adam (DEMO)', matric_no: 'DEMO-C001', component: 'Marketing' },
      { name: 'Hakim (DEMO)', matric_no: 'DEMO-C002', component: 'Product Planning' },
      { name: 'Danish (DEMO)', matric_no: 'DEMO-C003', component: 'Financial Planning' },
    ],
    profile: { market: 'staff and postgraduate drivers across the main campus car parks', competitors: 'manual guards and generic parking apps without campus coverage', product: 'an occupancy-detection camera module per car park row and a reservation app', price: 'RM 3 per event reservation and a RM 1,200 monthly licence to the university', startup: 'RM 27,000 for cameras, edge computers and app development', revenue: 'RM 4,800 per month from licences and reservations', breakeven: 'month 12', innovation: 'event-day dynamic allocation that opens restricted bays automatically' },
  },
];

/** 3 sections x 3 questions. Topics match the default proposal template sections. */
export const DEMO_QUESTIONS = [
  { section: 'Marketing', topic: 'Target Market', question_type: 'structured', marks: 10, question_text: '<p>Describe the <strong>target market</strong> for your group\'s business. Identify the primary customer segment, estimate its size on campus, and explain the key needs or pain points that your business addresses.</p>' },
  { section: 'Marketing', topic: 'Marketing Strategy', question_type: 'long_answer', marks: 10, question_text: '<p>Propose a <strong>marketing strategy</strong> for the first six months of operation. Cover positioning, pricing approach, promotion channels (online and on-campus), and how you will measure success.</p>' },
  { section: 'Marketing', topic: 'Competitive Analysis', question_type: 'case_study', marks: 10, question_text: '<p>Conduct a <strong>competitive analysis</strong>. Identify at least two existing alternatives that your customers use today, compare them with your business on price, convenience and sustainability, and state your competitive advantage.</p>' },
  { section: 'Product Planning', topic: 'Business Problem', question_type: 'structured', marks: 10, question_text: '<p>State the <strong>business problem</strong> your group is solving. Explain who experiences the problem, how often, and what evidence (observations, surveys or data) shows that the problem is real on campus.</p>' },
  { section: 'Product Planning', topic: 'Product / Service Planning', question_type: 'long_answer', marks: 10, question_text: '<p>Describe the <strong>product or service</strong> in detail: its core features, the technology used, the customer journey from first contact to repeat use, and the minimum viable version you would launch first.</p>' },
  { section: 'Product Planning', topic: 'Innovation', question_type: 'scenario', marks: 10, question_text: '<p>A competitor launches a similar service next semester. Explain the <strong>innovation</strong> in your product or process that is difficult to copy, and how you would continue to improve it.</p>' },
  { section: 'Financial Planning', topic: 'Operations Plan', question_type: 'structured', marks: 10, question_text: '<p>Prepare an <strong>operations plan</strong>: the key activities, staffing (roles and hours), equipment, suppliers and the monthly operating costs needed to deliver the service reliably.</p>' },
  { section: 'Financial Planning', topic: 'Financial Plan', question_type: 'structured', marks: 10, question_text: '<p>Prepare the <strong>financial plan</strong>: start-up cost, sources of funding, pricing, projected monthly revenue for the first year, and the expected break-even point. Show your working.</p>' },
  { section: 'Financial Planning', topic: 'Conclusion', question_type: 'short_answer', marks: 10, question_text: '<p>Write a <strong>conclusion</strong> that summarises why this business is financially sustainable and the main risks the group must manage in year one.</p>' },
];

/** Generate DEMO answer text for a question topic from a group profile. */
export function demoAnswer(topic, g) {
  const p = g.profile;
  switch (topic) {
    case 'Target Market':
      return `<p><strong>Primary segment.</strong> ${g.business_name} targets ${p.market}. From our informal count during one week, this segment represents several thousand potential users across the main campus.</p><p><strong>Key needs.</strong> Customers want convenience, predictable cost and a visibly sustainable option. Our survey of 60 respondents (DEMO data) found that 72% would switch providers for a greener service at the same price.</p>`;
    case 'Marketing Strategy':
      return `<p><strong>Positioning.</strong> The convenient, sustainable choice on campus. <strong>Pricing.</strong> ${p.price}.</p><p><strong>Promotion.</strong> Launch week booths at the student centre, Instagram and TikTok reels, residential college ambassadors and a referral code that gives both parties a discount.</p><p><strong>Measurement.</strong> Weekly active users, repeat-order rate and cost per acquisition reviewed every fortnight.</p>`;
    case 'Competitive Analysis':
      return `<p>Customers currently rely on ${p.competitors}.</p><ul><li><strong>Price:</strong> comparable or lower because we operate only on campus.</li><li><strong>Convenience:</strong> faster because our team is based inside the campus.</li><li><strong>Sustainability:</strong> our strongest advantage; competitors do not offer it.</li></ul><p><strong>Competitive advantage:</strong> a campus-only focus combined with a measurable sustainability promise.</p>`;
    case 'Business Problem':
      return `<p>${g.business_idea}</p><p>The problem is experienced daily by ${p.market}. Our observations over five days and a short survey (DEMO data) confirmed that the current situation causes waste, delays and frustration, and that no existing campus service addresses it.</p>`;
    case 'Product / Service Planning':
      return `<p><strong>Core offering.</strong> ${p.product}.</p><p><strong>Customer journey.</strong> Discover through campus promotion, register with a student email, use the service, receive a confirmation, and return as a repeat customer through loyalty points.</p><p><strong>Minimum viable version.</strong> A single-location pilot for one semester with manual fallback processes before scaling to the whole campus.</p>`;
    case 'Innovation':
      return `<p>Our key innovation is ${p.innovation}. It is difficult to copy because it depends on data we collect from day one and on relationships with campus units.</p><p>We will continue improving through monthly user feedback sessions and by releasing a new feature every semester.</p>`;
    case 'Operations Plan':
      return `<p><strong>Key activities.</strong> Daily service delivery, maintenance, customer support and weekly reporting.</p><p><strong>Staffing.</strong> Three founders working part-time (15 hours each per week) plus two part-time student assistants during peak hours.</p><p><strong>Equipment and suppliers.</strong> ${p.startup.split(' for ')[1] || 'core equipment'} sourced from local suppliers with a maintenance contract.</p><p><strong>Monthly operating cost.</strong> Approximately RM 3,200 covering wages, consumables, hosting and maintenance.</p>`;
    case 'Financial Plan':
      return `<p><strong>Start-up cost:</strong> ${p.startup}.</p><p><strong>Funding:</strong> founders\' contribution (40%), university entrepreneurship grant (40%) and a small family loan (20%).</p><p><strong>Pricing:</strong> ${p.price}.</p><p><strong>Projected revenue:</strong> ${p.revenue}, growing 5% per month after the pilot.</p><p><strong>Break-even:</strong> expected in ${p.breakeven}, based on monthly operating costs of RM 3,200.</p>`;
    case 'Conclusion':
      return `${g.business_name} is financially sustainable because recurring revenue exceeds operating costs after the pilot period and start-up costs are recovered by ${p.breakeven}. The main year-one risks are slower adoption than projected, equipment downtime and dependence on campus approvals, which we manage through a phased pilot and a maintenance reserve.`;
    default:
      return `<p>DEMO answer for ${topic}.</p>`;
  }
}
