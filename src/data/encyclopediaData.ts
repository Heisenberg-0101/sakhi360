export interface EncyclopediaSection {
  id: string;
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface EncyclopediaArticle {
  id: string;
  title: string;
  subtitle: string;
  category:
    | 'PCOS & Hormones'
    | 'Menstrual & Reproductive'
    | 'Mental Well-being'
    | 'Safety & Legal Rights'
    | 'Digital Privacy';
  lastReviewed: string;
  infobox: {
    heading: string;
    rows: Array<{ label: string; value: string }>;
  };
  lead: string;
  sections: EncyclopediaSection[];
  relatedIds: string[];
  references: string[];
  actionTarget?: {
    pillar: 'body' | 'mind' | 'safety' | 'defense' | 'growth';
    label: string;
  };
}

export const ENCYCLOPEDIA_ARTICLES: EncyclopediaArticle[] = [
  {
    id: 'pcos',
    title: 'Polycystic Ovary Syndrome (PCOS)',
    subtitle: 'Endocrine & metabolic condition affecting ovulation, androgen balance, and insulin sensitivity',
    category: 'PCOS & Hormones',
    lastReviewed: 'November 2026',
    infobox: {
      heading: 'PCOS Clinical Summary',
      rows: [
        { label: 'Specialty', value: 'Gynecology, Endocrinology' },
        { label: 'Prevalence', value: '~1 in 5 young Indian women (often undiagnosed)' },
        { label: 'Diagnostic Standard', value: 'Rotterdam Criteria (2 of 3 features)' },
        { label: 'Core Domains', value: 'Ovulatory irregularity · Androgen excess · Ovarian morphology' },
        { label: 'Common Lab Panel', value: 'LH/FSH, Free Testosterone, TSH, Prolactin, Fasting Insulin, HbA1c' },
        { label: 'Imaging', value: 'Pelvic / Transabdominal Ultrasound (day 2–5)' },
      ],
    },
    lead:
      'Polycystic ovary syndrome (PCOS) is a common hormonal and metabolic condition affecting reproductive-age women. Despite its name, having ovarian "cysts" (which are actually immature follicles) is neither required nor sufficient on its own for diagnosis. Early recognition helps prevent long-term metabolic, cardiovascular, and fertility complications.',
    sections: [
      {
        id: 'signs-symptoms',
        heading: '1. Signs and Symptoms',
        paragraphs: [
          'Symptoms often emerge gradually during adolescence or early twenties and vary widely from person to person. Some individuals experience primarily cycle irregularity, while others notice skin, hair, or energy changes first.',
        ],
        bullets: [
          'Irregular or infrequent periods: Cycles consistently longer than 35 days (oligomenorrhea), fewer than 8–9 periods per year, or unpredictable bleeding.',
          'Hyperandrogenic skin and hair changes: Persistent jawline/chin cystic acne, excess coarse hair on the face, chest, or abdomen (hirsutism), or scalp hair thinning.',
          'Energy and metabolic signals: Post-meal fatigue or sugar crashes, unexplained central weight gain, or darkened velvety skin patches on the neck or underarms (acanthosis nigricans).',
          'Mood and sleep impacts: Higher rates of anxiety, low mood, and sleep disruption linked to hormonal and insulin fluctuations.',
        ],
      },
      {
        id: 'rotterdam-criteria',
        heading: '2. Rotterdam Diagnostic Criteria (2 of 3)',
        paragraphs: [
          'Clinicians internationally diagnose PCOS in adults using the Rotterdam Consensus Criteria after ruling out mimicking conditions such as thyroid disorders, hyperprolactinemia, or non-classic congenital adrenal hyperplasia. At least two of the following three features must be present:',
        ],
        bullets: [
          'Ovulatory dysfunction: Irregular, infrequent, or absent menstrual cycles.',
          'Clinical or biochemical hyperandrogenism: Visible excess facial/body hair, severe acne, or elevated blood androgen levels (e.g., total/free testosterone, DHEA-S).',
          'Polycystic ovarian morphology (PCOM): Ultrasound showing multiple small peripheral follicles or enlarged ovarian volume (note: ultrasound alone is not recommended for diagnosis within 8 years of first menstruation due to normal adolescent multifollicular ovaries).',
        ],
      },
      {
        id: 'pathophysiology',
        heading: '3. Insulin Resistance & Hormonal Feedback Loop',
        paragraphs: [
          'Between 50% and 75% of individuals with PCOS—including lean PCOS phenotypes—exhibit underlying insulin resistance. When muscle and fat cells respond weakly to insulin, the pancreas produces extra insulin to keep blood sugar stable.',
          'Elevated circulating insulin directly stimulates ovarian theca cells to produce higher amounts of androgens and suppresses hepatic sex hormone-binding globulin (SHBG). This raises free testosterone, which disrupts normal follicle maturation and ovulation.',
        ],
      },
      {
        id: 'clinical-tests',
        heading: '4. Recommended Clinical Workup',
        paragraphs: [
          'Digital symptom screeners (such as Sakhi360’s Early PCOS Detector) can highlight overlapping markers, but only a qualified physician can confirm PCOS through targeted laboratory tests and clinical history:',
        ],
        bullets: [
          'Hormonal panel (typically drawn fasting in early follicular phase, days 2–5): LH, FSH, Total & Free Testosterone, DHEA-S, TSH (thyroid), and Serum Prolactin.',
          'Metabolic screening: Fasting glucose, Fasting insulin (for HOMA-IR), HbA1c, and fasting lipid profile.',
          'Pelvic ultrasound: Evaluates endometrial thickness and ovarian follicle count when clinically indicated.',
        ],
      },
      {
        id: 'management',
        heading: '5. Evidence-Based Management',
        paragraphs: [
          'Treatment is individualized around the person’s primary goals—whether regulating cycles, clearing skin/hair symptoms, supporting fertility, or improving insulin sensitivity.',
        ],
        bullets: [
          'Nutrition & movement: Balanced protein + high-fiber meals to blunt glucose spikes, paired with regular resistance training and brisk walking to improve insulin sensitivity even without weight loss.',
          'Sleep & stress hygiene: Prioritizing 7–8 hours of sleep reduces evening cortisol, which otherwise worsens insulin resistance.',
          'Targeted medical therapy (prescribed by a doctor): Combined hormonal contraceptives for cycle/endometrial protection and acne; insulin sensitizers such as metformin or myo-inositol; anti-androgens where appropriate.',
        ],
      },
      {
        id: 'differential',
        heading: '6. Conditions That Mimic PCOS',
        paragraphs: [
          'Because irregular periods and fatigue are shared across multiple conditions, doctors routinely rule out hypothyroidism, elevated prolactin, premature ovarian insufficiency, hypothalamic amenorrhea (from under-fueling or intense stress), and iron/vitamin D/B12 deficiencies.',
        ],
      },
    ],
    relatedIds: ['irregular-cycles', 'insulin-resistance', 'hyperandrogenism', 'mental-health-hormones'],
    references: [
      'Teede HJ et al. (2023). International Evidence-based Guideline for the Assessment and Management of Polycystic Ovary Syndrome.',
      'The Week (2025). PCOS: The hidden struggle of one in five young Indian women.',
      'ACOG Committee Opinion No. 651 (2015). Menstrual Cycle as a Vital Sign.',
    ],
    actionTarget: { pillar: 'body', label: 'Open Early PCOS Detector' },
  },
  {
    id: 'irregular-cycles',
    title: 'Irregular Menstrual Cycles & Cycle Physiology',
    subtitle: 'Understanding cycle variability, four hormonal phases, and clinical red flags',
    category: 'Menstrual & Reproductive',
    lastReviewed: 'November 2026',
    infobox: {
      heading: 'Cycle Physiology Reference',
      rows: [
        { label: 'Typical Adult Range', value: '21 to 35 days (day 1 to next day 1)' },
        { label: 'Normal Period Bleed', value: '2 to 7 days' },
        { label: 'Oligomenorrhea', value: 'Cycles consistently > 35 days' },
        { label: 'Secondary Amenorrhea', value: '3+ missed months in prior regular cycles' },
        { label: 'Clinical Consensus', value: 'ACOG Vital Sign Standard' },
      ],
    },
    lead:
      'A menstrual cycle is counted from the first day of full menstrual bleeding to the day before the next period begins. Most mainstream trackers assume a rigid 28-day clock, creating needless anxiety for anyone whose natural rhythm runs 30–36 days or varies under stress, travel, or PCOS.',
    sections: [
      {
        id: 'four-phases',
        heading: '1. The Four Phases of the Cycle',
        paragraphs: [
          'The menstrual cycle is coordinated by feedback between the hypothalamus, pituitary gland, and ovaries (the HPO axis):',
        ],
        bullets: [
          'Menstrual Phase (Days 1–5): Estrogen and progesterone drop, triggering shedding of the uterine lining.',
          'Follicular Phase (Day 1 to Ovulation): FSH stimulates ovarian follicles; rising estrogen rebuilds the endometrium. Stress or PCOS typically lengthens this phase.',
          'Ovulatory Window (Mid-cycle): An LH surge releases a mature egg. Cervical mucus often becomes clear and stretchy.',
          'Luteal Phase (~11–16 days): The corpus luteum secretes progesterone. If pregnancy does not occur, progesterone falls and the next cycle begins.',
        ],
      },
      {
        id: 'when-to-see-doctor',
        heading: '2. When Irregularity Needs Medical Review',
        paragraphs: [
          'Occasional 3–5 day shifts from exams, illness, or sleep loss are normal. Seek a clinician’s evaluation if you notice persistent patterns:',
        ],
        bullets: [
          'Cycles repeatedly shorter than 21 days or longer than 35 days.',
          'Going 90+ days without a period (risk of endometrial buildup if unaddressed).',
          'Soaking through a pad or tampon every 1–2 hours for consecutive hours, or bleeding lasting > 7 days.',
          'Severe pelvic pain that prevents daily study or work despite standard pain relief.',
        ],
      },
    ],
    relatedIds: ['pcos', 'insulin-resistance', 'pregnancy-care'],
    references: [
      'ACOG Committee Opinion No. 651 (2015). Menstrual Cycle as a Vital Sign. doi:10.1097/AOG.0000000000001215.',
    ],
    actionTarget: { pillar: 'body', label: 'Open Irregular-Cycle Tracker' },
  },
  {
    id: 'insulin-resistance',
    title: 'Insulin Resistance & Metabolic Markers',
    subtitle: 'How insulin signaling interacts with ovarian hormones, energy, and skin markers',
    category: 'PCOS & Hormones',
    lastReviewed: 'November 2026',
    infobox: {
      heading: 'Metabolic Markers',
      rows: [
        { label: 'Skin Sign', value: 'Acanthosis nigricans (neck, underarm folds)' },
        { label: 'Key Lab Tests', value: 'Fasting Insulin, Fasting Glucose, HbA1c' },
        { label: 'Daily Symptoms', value: 'Post-meal drowsiness, intense sweet cravings' },
        { label: 'Primary Lifestyle Lever', value: 'Protein-first meals + strength movement' },
      ],
    },
    lead:
      'Insulin is the hormone that moves glucose from the bloodstream into cells for energy. In insulin resistance, cells require higher insulin levels to absorb the same amount of glucose. Crucially, fasting blood sugar and HbA1c can stay completely normal for years while fasting insulin is already elevated.',
    sections: [
      {
        id: 'recognizing-signs',
        heading: '1. Subtle Early Indicators',
        paragraphs: [
          'Because standard blood glucose tests often miss early hyperinsulinemia, clinicians watch for physical and symptom clues:',
        ],
        bullets: [
          'Acanthosis nigricans: Dark, velvety hyperpigmentation on the back of the neck, knuckles, or underarms.',
          'Postprandial crash: Heavy sleepiness or brain fog 60–90 minutes after carbohydrate-rich meals.',
          'Reactive cravings: Sudden irritability or shakiness if meals are delayed.',
        ],
      },
      {
        id: 'practical-habits',
        heading: '2. Practical Metabolic Support',
        paragraphs: [
          'Simple meal sequencing and muscle engagement lower post-meal insulin spikes without restrictive dieting:',
        ],
        bullets: [
          'Eat fiber (vegetables/dal) and protein (paneer, eggs, legumes, curd, tofu) before refined starches.',
          'Take a 10–15 minute walk after dinner—contracting leg muscles absorb glucose independently of insulin.',
          'Avoid skipping meals followed by high-sugar snacks, which exaggerates insulin surges.',
        ],
      },
    ],
    relatedIds: ['pcos', 'hyperandrogenism'],
    references: [
      'Diamanti-Kandarakis E, Dunaif A. (2012). Insulin resistance and the polycystic ovary syndrome revisited. Endocrine Reviews.',
    ],
    actionTarget: { pillar: 'body', label: 'Check Metabolic Markers in Screener' },
  },
  {
    id: 'hyperandrogenism',
    title: 'Hyperandrogenism: Hormonal Acne, Hirsutism & Hair Thinning',
    subtitle: 'Understanding androgen-sensitive skin and hair changes in women’s health',
    category: 'PCOS & Hormones',
    lastReviewed: 'November 2026',
    infobox: {
      heading: 'Clinical Signs',
      rows: [
        { label: 'Acne Distribution', value: 'Lower third of face (jawline, chin, neck)' },
        { label: 'Hirsutism', value: 'Coarse terminal hair on lip, chin, chest, abdomen' },
        { label: 'Scalp Pattern', value: 'Widening central part (androgenetic alopecia)' },
        { label: 'Lab Check', value: 'Total/Free Testosterone, DHEA-S, 17-OHP' },
      ],
    },
    lead:
      'Androgens (such as testosterone and DHEA-S) are normally present in women in small amounts. When ovaries or adrenal glands produce excess androgens—or hair follicles and oil glands become extra sensitive to them—characteristic skin and hair signs appear.',
    sections: [
      {
        id: 'acne-vs-hormonal',
        heading: '1. Hormonal Acne vs. Everyday Breakouts',
        paragraphs: [
          'While surface blackheads on the T-zone often respond to topical washes, hormonal acne driven by elevated androgens typically appears as deeper, tender cysts along the jawline, chin, and upper neck and frequently flares before menstruation.',
        ],
      },
      {
        id: 'hair-changes',
        heading: '2. Hirsutism and Scalp Thinning',
        paragraphs: [
          'Androgens transform fine, light vellus hairs on the chin, upper lip, sideburns, or lower abdomen into thicker terminal hairs (hirsutism). Simultaneously, high dihydrotestosterone (DHT) at the scalp can shrink scalp follicles, causing a widening hair part. Always check ferritin (iron stores), vitamin D, and thyroid alongside androgens when evaluating hair loss.',
        ],
      },
    ],
    relatedIds: ['pcos', 'insulin-resistance'],
    references: [
      'Martin KA et al. (2018). Evaluation and Treatment of Hirsutism in Premenopausal Women: Endocrine Society Clinical Practice Guideline.',
    ],
    actionTarget: { pillar: 'body', label: 'Evaluate Skin & Hair Markers' },
  },
  {
    id: 'pregnancy-care',
    title: 'Pregnancy Milestones, Nutrition & Urgent Red Flags',
    subtitle: 'Trimester-by-trimester prenatal checkups and emergency warning signs',
    category: 'Menstrual & Reproductive',
    lastReviewed: 'November 2026',
    infobox: {
      heading: 'Antenatal Essentials',
      rows: [
        { label: '1st Trimester (Wks 1–12)', value: 'Folic acid 400 mcg, baseline CBC/TSH, dating scan' },
        { label: '2nd Trimester (Wks 13–26)', value: 'Anomaly scan (18–20w), Iron/Calcium, OGTT (24–28w)' },
        { label: '3rd Trimester (Wks 27–40)', value: 'BP checks, daily fetal kick counts, birth plan' },
      ],
    },
    lead:
      'Consistent antenatal checkups protect both maternal and fetal health by catching anemia, gestational diabetes, and blood-pressure disorders early.',
    sections: [
      {
        id: 'urgent-red-flags',
        heading: '1. Red Flags Requiring Immediate Hospital Care',
        paragraphs: [
          'Never wait for a scheduled appointment if any of the following occur during pregnancy:',
        ],
        bullets: [
          'Vaginal bleeding, gush of watery fluid, or severe one-sided abdominal pain.',
          'Sudden swelling of face/hands, severe persistent headache, or blurred vision (preeclampsia warning signs).',
          'Noticeable reduction in fetal movements in the third trimester.',
          'High fever or painful urination.',
        ],
      },
    ],
    relatedIds: ['irregular-cycles', 'breast-self-check'],
    references: [
      'WHO Recommendations on Antenatal Care for a Positive Pregnancy Experience.',
    ],
    actionTarget: { pillar: 'body', label: 'View Trimester Guide' },
  },
  {
    id: 'breast-self-check',
    title: 'Breast Self-Awareness & Monthly Check Guide',
    subtitle: 'How to recognize normal cyclic breast changes vs. signs worth clinical review',
    category: 'Menstrual & Reproductive',
    lastReviewed: 'November 2026',
    infobox: {
      heading: 'Self-Check Protocol',
      rows: [
        { label: 'Best Timing', value: '3–5 days after period ends (least tender)' },
        { label: 'Frequency', value: 'Once monthly on a consistent date' },
        { label: 'Technique', value: 'Flat finger pads · 3 pressure levels · Quadrant + armpit sweep' },
      ],
    },
    lead:
      'Breast self-awareness helps women learn what is normal for their own bodies so new or persistent changes are noticed early. Most breast lumps in young women are benign cysts or fibroadenomas, yet any persistent change deserves a doctor’s exam.',
    sections: [
      {
        id: 'what-to-look-for',
        heading: '1. Warning Signs to Discuss With a Doctor',
        paragraphs: ['Contact a clinic or gynecologist if you notice:'],
        bullets: [
          'A new, firm, painless lump or localized thickening that persists past one full menstrual cycle.',
          'Skin dimpling, puckering ("orange-peel" texture), redness, or warmth.',
          'Newly inverted nipple or spontaneous bloody/clear single-duct discharge.',
          'Persistent swelling in the armpit or above the collarbone.',
        ],
      },
    ],
    relatedIds: ['pregnancy-care', 'irregular-cycles'],
    references: [
      'Breast Health Global Initiative / National Cancer Institute Clinical Breast Awareness Guidelines.',
    ],
    actionTarget: { pillar: 'body', label: 'Start 5-Step Breast Check' },
  },
  {
    id: 'mental-health-hormones',
    title: 'Mental Well-being, Stress & Hormonal Balance',
    subtitle: 'Evidence-based coping tools, cortisol-cycle effects, and judgment-free support',
    category: 'Mental Well-being',
    lastReviewed: 'November 2026',
    infobox: {
      heading: 'Mind-Body Link',
      rows: [
        { label: 'PCOS Overlap', value: 'Higher screening rates of anxiety & mood shifts' },
        { label: 'Autonomic Reset', value: '4-7-8 paced breathing & 5-4-3-2-1 grounding' },
        { label: 'Helpline (India)', value: '14416 (Tele-MANAS 24x7) · 181 (Women Helpline)' },
      ],
    },
    lead:
      'Chronic psychological stress activates the hypothalamic-pituitary-adrenal (HPA) axis, raising cortisol. Elevated cortisol can worsen insulin resistance, disrupt sleep, and delay ovulation—creating a two-way bridge between mental well-being and menstrual health.',
    sections: [
      {
        id: 'coping-mechanisms',
        heading: '1. Immediate Physiological Reset Tools',
        paragraphs: [
          'Extended exhalations (such as 4-7-8 breathing: inhale 4s, hold 7s, exhale 8s) stimulate the vagus nerve and lower heart rate within 2–3 minutes. Sensory 5-4-3-2-1 grounding interrupts acute panic spirals by anchoring attention in the immediate physical environment.',
        ],
      },
    ],
    relatedIds: ['pcos', 'privacy-safety-rights'],
    references: [
      'Dokras A et al. (2018). Androgen Excess and PCOS Society recommendations on depression and anxiety screening in PCOS.',
    ],
    actionTarget: { pillar: 'mind', label: 'Open Encrypted Journal & AI Support' },
  },
  {
    id: 'privacy-safety-rights',
    title: 'Digital Privacy, Zero-FIR & NCII Takedown Rights',
    subtitle: 'Protecting health data, countering stalkerware, and legal remedies for image-based abuse',
    category: 'Safety & Legal Rights',
    lastReviewed: 'November 2026',
    infobox: {
      heading: 'Emergency & Legal Reference (India)',
      rows: [
        { label: 'Emergency Dispatch', value: '112 (All-in-one) · 181 (Women Helpline)' },
        { label: 'Cyber Crime Portal', value: '1930 · cybercrime.gov.in' },
        { label: 'NCII Takedown Law', value: 'IT Rules 2021 Rule 3(2)(b) — 24-hour removal' },
        { label: 'Period App Privacy', value: '84% of studied apps leaked user data (ORCHA 2022)' },
      ],
    },
    lead:
      'Independent audits by ORCHA (2022) and Privacy International found that the vast majority of commercial period-tracking apps share intimate reproductive data with third-party ad brokers. Sakhi360 stores sensitive entries encrypted locally with AES-256-GCM and provides rapid legal defense tools.',
    sections: [
      {
        id: 'zero-fir',
        heading: '1. Right to File a Zero-FIR',
        paragraphs: [
          'Under Indian criminal procedure, a police station cannot refuse to register a cognizable offense because the incident occurred outside its local jurisdiction. A Zero-FIR can be filed at any nearby police station and is then transferred to the appropriate station.',
        ],
      },
      {
        id: 'deepfake-takedown',
        heading: '2. Deepfake & Non-Consensual Imagery Takedown',
        paragraphs: [
          'Under Rule 3(2)(b) of India’s Information Technology Rules (2021) and IT Act Sections 66E, 67, and 67A, social platforms must act within 24 hours to remove non-consensual morphed or intimate imagery. Generating a local cryptographic hash via StopNCII.org blocks re-uploads across participating platforms without uploading your raw photos.',
        ],
      },
    ],
    relatedIds: ['mental-health-hormones', 'pcos'],
    references: [
      'ORCHA (2022). Privacy issues with period tracking apps.',
      'Privacy International. No Body’s Business but Mine, Vol. 2.',
      'NCRB Crime in India 2022.',
    ],
    actionTarget: { pillar: 'defense', label: 'Open Takedown & Privacy Shield' },
  },
];
