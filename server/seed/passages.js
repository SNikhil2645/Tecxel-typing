require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Passage = require('../models/Passage');
const Admin = require('../models/Admin');
const connectDB = require('../config/db');

// ROUND 1: THE SPRINTER (2 Minutes - Easy)
// Purpose: Basic typing speed, plain English, simple sentences, smooth flow.
const round1Passages = [
  {
    round: 1,
    title: 'The Spark of Innovation',
    difficulty: 'easy',
    content: 'Technology continues to transform the way we learn and collaborate every day. Great builders look beyond standard problems to design solutions that create lasting positive change. When curiosity meets dedicated practice, exceptional ideas turn into real inventions that push communities forward. Every small effort contributes to a brighter tomorrow where people can connect easily across the world.',
  },
  {
    round: 1,
    title: 'Morning in the Campus Library',
    difficulty: 'easy',
    content: 'Early in the morning, the college library was quiet and peaceful. Sunlight streamed through the large windows, casting warm shadows across long wooden tables. Students sat with open notebooks, reading chapters and preparing for their upcoming project presentations. The gentle sound of turning pages filled the room, creating an atmosphere of calm dedication and shared ambition.',
  },
  {
    round: 1,
    title: 'Focus and Speed',
    difficulty: 'easy',
    content: 'Speed in typing comes from deliberate rhythm rather than sudden bursts of excitement. Keep your fingers resting lightly on the home row keys and let your eyes guide your hands smoothly. Steady breathing and consistent daily practice build the muscle memory needed for effortless typing. When you remain relaxed and confident, your accuracy naturally increases along with your speed.',
  },
  {
    round: 1,
    title: 'The Coding Workshop',
    difficulty: 'easy',
    content: 'A group of first year students gathered in the computer center for an introductory programming workshop. The mentor explained how simple logic can be combined to solve interesting real world challenges. Everyone watched attentively as lines of clear instructions appeared on the projection screen. By the end of the session, each student had written and tested their very first program.',
  },
  {
    round: 1,
    title: 'Building for the Future',
    difficulty: 'easy',
    content: 'Engineering is the craft of applying scientific knowledge to solve human challenges. From reliable power grids to modern web applications, thoughtful design ensures that systems perform safely under pressure. When creators take pride in their work, they build digital experiences that inspire confidence, improve daily life, and open new possibilities for the next generation.',
  },
  {
    round: 1,
    title: 'The Rhythm of the Keyboard',
    difficulty: 'easy',
    content: 'A good typist feels the cadence of language with each strike of a key. Words form smoothly like a flowing river as thoughts translate directly into digital form on the screen. Trust your muscle memory, maintain an upright sitting posture, and let your fingers find their natural pace. With patience and persistence, typing becomes second nature.',
  },
  {
    round: 1,
    title: 'Journey of a Team',
    difficulty: 'easy',
    content: 'Working in a team teaches the value of listening and sharing ideas openly. Each member brings a unique viewpoint and special skills that make the entire group stronger. When problems arise, team members support one another, breaking difficult tasks into manageable steps until the goal is reached. Shared success always brings the greatest satisfaction.',
  },
  {
    round: 1,
    title: 'Curiosity and Discovery',
    difficulty: 'easy',
    content: 'Curiosity is the engine that drives all human discovery and scientific progress. When we ask sincere questions about how things work, we uncover fascinating patterns in nature and technology. Lifelong learning keeps the mind active, adaptable, and ready to meet fresh challenges with enthusiasm and creative energy.',
  },
  {
    round: 1,
    title: 'The Campus Garden',
    difficulty: 'easy',
    content: 'Between the two academic blocks lies a green garden filled with shady trees and flowering plants. Students often gather there during lunch breaks to relax, discuss lecture topics, and share stories. The gentle breeze and fresh air provide a refreshing pause in the middle of a busy college schedule, helping everyone recharge their minds.',
  },
  {
    round: 1,
    title: 'Practice Leads to Mastery',
    difficulty: 'easy',
    content: 'Mastery is not an accident but the predictable result of focused daily repetition. Regular practice refines your technique, sharpens your reflex responses, and instills quiet confidence. Celebrate small improvements each day as you progress steadily toward your goals, knowing that dedication always produces remarkable results.',
  },
];

// ROUND 2: THE PRECISIONIST (3 Minutes - Medium)
// Purpose: Speed + Punctuation + Accuracy. A proper natural story with dialogue, quotes, commas,
// exclamation marks, question marks, apostrophes, and capital letters. Long enough for 3 minutes (~1300-1600 chars).
const round2Passages = [
  {
    round: 2,
    title: 'The Technical Fest Morning',
    difficulty: 'medium',
    content: '"Are you ready for the technical fest?" Rahul asked, adjusting his college lanyard as they walked through the campus gates.\n\n"Yes, I\'m completely ready!" Arjun replied with a bright smile. "I\'ve been practicing for the typing championship every evening since last week. My fingers are finally keeping pace with my thoughts!"\n\nThey walked towards the auditorium, discussing their strategies for the competition. Outside the hall, banners announced: "TECXEL 2026 — Think Beyond, Build Beyond." Students from various departments—Computer Science, Information Technology, and Electronics—had gathered in large groups. Some were reviewing keyboard shortcuts, while others chatted excitedly about the hackathon scheduled for the afternoon.\n\n"Look at the crowd," whispered Sneha, joining them near the registration desk. "Did you hear that over sixty participants registered for this event alone?"\n\n"That\'s wonderful news!" said Arjun. "Healthy competition brings out the best in everyone, doesn\'t it?"\n\n"Indeed it does," Rahul agreed, "but remember our mentor\'s golden rule: don\'t rush blindly at the cost of precision. A single misplaced comma or quote mark can drop your accuracy score in seconds!"\n\nInside the air-conditioned hall, rows of glowing monitors awaited them. The organizers tested the audio speakers, and a cheerful voice announced: "Welcome, participants! Please take your assigned seats and prepare for Round Two." With steady hands and focused eyes, Rahul took a deep breath, placed his fingers on the keyboard, and waited for the signal to begin.',
  },
  {
    round: 2,
    title: 'The Coding Lab Project',
    difficulty: 'medium',
    content: '"Wait, did you check the latest pull request?" Priya asked, leaning over the partition in the computer laboratory.\n\n"Not yet, but I\'m reviewing the error logs right now," Vikram replied, squinting at his monitor. "Everything looked solid during local testing, but the build pipeline threw an unexpected warning!"\n\n"What kind of warning was it?" she inquired, pulling up a chair beside his desk. "Was it a syntax issue, or did someone forget an import statement?"\n\n"Neither," Vikram chuckled, pointing to line forty-two. "Someone wrote: \'Database connection established successfully!\' but forgot to close the quotation marks. It\'s always the little details that trip us up, isn\'t it?"\n\nThey both laughed, appreciating how crucial attention to detail truly was in software development. Outside the laboratory window, rain began to fall in steady sheets, tapping rhythmically against the glass panes. Inside, the quiet hum of computer fans and the steady clatter of mechanical keyboards created a comforting atmosphere of shared productivity.\n\n"Let\'s finish this module before lunch," Priya suggested cheerfully. "If we submit the report by two o\'clock, Professor Sharma promised he\'d review our architecture diagram ahead of schedule!"\n\n"Deal!" Vikram nodded eagerly. "I\'ll fix the punctuation in the documentation files, while you verify the responsive layout. Together, we\'ll make sure this release is flawless!" With renewed energy, they resumed typing, determined to deliver their best work yet.',
  },
  {
    round: 2,
    title: 'The College Debate Finals',
    difficulty: 'medium',
    content: '"Ladies and gentlemen, esteemed judges, and fellow students!" the moderator announced, her voice echoing clearly across the packed hall. "Welcome to the grand finale of the annual inter-college debate championship!"\n\nApplause erupted from every corner of the room. On the stage sat two teams: one arguing for rapid technological disruption, and the other advocating for ethical oversight and digital privacy. Both teams looked confident, well-prepared, and eager to present their arguments.\n\n"Can innovation truly thrive without ethical guardrails?" asked Ananya, stepping forward to the podium. "We believe the answer is a resounding no! When algorithms influence healthcare, education, and governance, accountability isn\'t just an option—it\'s a fundamental necessity."\n\nHer teammate, Rohan, nodded in agreement. He whispered to his partner: "That was brilliant! Keep the momentum going, and don\'t lose eye contact with the judges."\n\nWhen the opposition rose to deliver their rebuttal, the debate intensified. "Isn\'t fear of failure the greatest barrier to progress?" countered their speaker passionately. "If we hesitate at every crossroad, how will humanity ever reach new frontiers?"\n\nThe audience listened intently, captivated by the eloquence and conviction displayed by both sides. When the final bell rang, the chief guest stood up to congratulate all four finalists, remarking: "Words have power; when delivered with clarity, precision, and purpose, they can change the world!"',
  },
  {
    round: 2,
    title: 'The Robotics Showcase',
    difficulty: 'medium',
    content: '"Careful with that sensor calibration!" warned Karthik, holding the robotic arm steady on the workbench. "If the angle drifts by even two degrees, the autonomous gripper won\'t lock onto the payload!"\n\n"Don\'t worry, I\'ve already adjusted the offsets," Meera replied calmly, typing commands into her laptop terminal. "Let\'s run the diagnostic routine one more time. Are you ready?"\n\n"Ready when you are!" he answered, taking a step back to observe the mechanism.\n\nWith a quiet beep, the small robotic rover whirred to life. Its blue indicator lights flashed three times, signaling that the wireless link had been established. Slowly and deliberately, the machine navigated around two obstacles on the testing mat, rotated ninety degrees to the left, and gently picked up the target block. A small crowd of visiting school students gasped in delight, clapping enthusiastically.\n\n"Look at that!" exclaimed one of the teachers. "How long did it take your team to design and assemble the entire system?"\n\n"About six weeks of hard work," Meera answered with pride. "We spent countless evenings designing the chassis, soldering circuit boards, and writing control algorithms. It wasn\'t easy, but seeing it work seamlessly makes every late night worthwhile!"\n\n"That\'s the spirit of engineering," Karthik added with a wide grin. "When passion meets disciplined practice, there\'s no limit to what you can create!"',
  },
  {
    round: 2,
    title: 'The Mentor\'s Advice',
    difficulty: 'medium',
    content: 'Professor Mukherjee settled into his armchair, looking warmly at the final-year students gathered in his office. "You\'ve all worked remarkably hard over the past four years," he began, pausing to sip his tea. "Now, as you prepare to step into the industry, what do you think is the single most valuable skill you\'ve acquired?"\n\n"Technical expertise?" ventured Tanvi hesitantly. "Or perhaps our ability to adapt to new programming frameworks?"\n\n"Those are certainly important," the professor replied, shaking his head gently. "However, the true differentiator is communication—the precision with which you express your ideas, both in code and in writing. Have you ever noticed how a poorly worded message can cause hours of unnecessary confusion?"\n\n"Yes, sir, that happened during our last hackathon!" admitted Rohan, smiling ruefully. "We spent half the night debugging an issue simply because two teammates had different interpretations of the word \'synchronous\'!"\n\n"Precisely!" Professor Mukherjee said, chuckling softly. "Clarity of thought breeds clarity of expression. Whether you\'re drafting an email to a client, documenting an API, or participating in a typing tournament, treat every word with respect. Choose the right punctuation, maintain your rhythm, and never underestimate the elegance of simplicity!" The students thanked him warmly, inspired by his practical wisdom.',
  },
  {
    round: 2,
    title: 'A Walk in the Rain',
    difficulty: 'medium',
    content: '"Did you remember to bring an umbrella?" Neha asked, gazing up at the dark storm clouds gathering over the campus library.\n\n"No, I thought the weather forecast predicted clear skies until evening!" Kabir replied, quickening his pace along the stone pathway. "Let\'s hurry; the clouds look ready to burst at any second!"\n\nBefore they could reach the computer science building, large raindrops began to splatter against the pavement, releasing the pleasant, earthy aroma of dry soil meeting fresh rain. Students scrambled across the courtyards, laughing and holding notebooks above their heads for shelter. Within moments, the entire campus was bathed in cool, refreshing rainfall.\n\n"Well, we\'re soaked anyway," Neha laughed, stepping under the portico of the cafeteria. "Shall we stop here for some hot ginger tea and samosas before heading back to the lab?"\n\n"That sounds like the best idea you\'ve had all day!" Kabir agreed enthusiastically. "Besides, watching the rain while discussing our final project feels much more inspiring than staring at blank slides in an empty classroom."\n\nThey found a cozy table near the open balcony, listening to the soothing sound of rain falling against the courtyard leaves, grateful for the unexpected pause in their busy afternoon.',
  },
  {
    round: 2,
    title: 'The Championship Briefing',
    difficulty: 'medium',
    content: '"Attention, participants!" the chief coordinator announced through the microphone, commanding immediate silence across the auditorium. "Before we initiate Round Two, please review the competition guidelines displayed on the main screen."\n\nEvery head turned toward the glowing projection. The rules were clear, straightforward, and strict:\n"First: pasting, external shortcuts, and browser extensions are strictly forbidden. Second: switching tabs or exiting fullscreen mode will trigger an immediate anti-cheat audit. Third: accuracy counts for exactly fifty percent of your overall score!"\n\n"Did you hear that, Rahul?" whispered Dev from the neighboring terminal. "Speed alone won\'t win this championship. If someone types eighty words per minute with ninety percent accuracy, their score will be lower than a typist who maintains seventy words per minute with ninety-nine percent accuracy!"\n\n"That\'s why it\'s called \'The Precisionist\' round," Rahul replied softly, adjusting his chair. "Every comma, period, and quotation mark matters. We need to stay calm, maintain an upright posture, and let our fingers glide across the keys without panicking."\n\n"Three minutes on the clock," the coordinator\'s voice echoed again. "Take your positions, take a deep breath, and get ready!"',
  },
  {
    round: 2,
    title: 'The Hackathon Midnight Sprint',
    difficulty: 'medium',
    content: 'It was three o\'clock in the morning, and the hackathon arena was alive with quiet energy. Empty coffee cups, crumpled snack wrappers, and notebooks covered the long banquet tables. Most teams were running on pure adrenaline, racing against the twelve-hour deadline.\n\n"How\'s the backend server holding up?" asked Divya, rubbing her tired eyes as she pushed her glasses up her nose.\n\n"Surprisingly well!" answered Samir, pointing to the monitoring dashboard on his second screen. "All thirty endpoints are responding within forty milliseconds, and our test suite passed with zero regressions. Can you believe it?"\n\n"Don\'t jinx it!" laughed Pooja, who was busy designing the frontend dashboard. "Remember what happened at last year\'s hackathon when someone said the word \'flawless\' five minutes before the final presentation?"\n\n"Let\'s not speak of that dark day," Samir chuckled, shuddering playfully. "This year, we\'ve tested every edge case, verified our input validations, and written clean, readable comments for every single function."\n\n"Good job, team," Divya said, raising her water bottle in a toast. "Let\'s finish the user documentation, take a brief walk around the corridor to clear our heads, and rehearse our three-minute pitch. We\'re going to win this!"',
  },
  {
    round: 2,
    title: 'The Library Treasure',
    difficulty: 'medium',
    content: '"Look what I found in the reference section!" Aditya whispered excitedly, carefully placing a thick, cloth-bound book onto the study table.\n\n"What is it?" asked Meenakshi, glancing up from her laptop. "It looks like it hasn\'t been opened in decades!"\n\n"It\'s the original proceedings from the 1984 International Conference on Computer Architecture," he replied, turning the yellowed pages with great care. "Look at these early schematics—every single logic gate was drawn by hand with ink pens and drafting rulers! Isn\'t that incredible?"\n\n"That\'s amazing," she agreed, leaning closer to examine the intricate circuit drawings. "Today, we generate complex microchips containing billions of transistors with automated synthesis tools, yet the foundational principles haven\'t changed at all!"\n\n"That\'s the beauty of our field," Aditya observed thoughtfully. "The tools evolve at breathtaking speed, but the underlying curiosity, rigor, and mathematical elegance remain timeless. We stand on the shoulders of giants who built entire digital worlds with nothing more than passion and perseverance!"\n\nThey spent the next half-hour studying the historical diagrams, inspired by the craftsmanship of an earlier generation of computer scientists.',
  },
  {
    round: 2,
    title: 'The Strategy Session',
    difficulty: 'medium',
    content: '"Let\'s break down the tournament bracket," suggested Ankit, drawing a diagram on the whiteboard in the team study room. "In the first round, everyone focused on raw speed. But in this second round, the passages contain dialogue, contractions, and varied punctuation."\n\n"What should our strategy be?" asked Shreya, leaning forward in her chair. "Should we deliberately slow down to avoid mistakes, or try to maintain our top speed throughout the entire three minutes?"\n\n"Neither extreme works," Ankit explained patiently. "If you type too slowly, your speed score will suffer heavily. On the other hand, if you rush carelessly and make four or five errors in a single sentence, you\'ll lose precious seconds correcting them, which hurts both speed and accuracy!"\n\n"So the secret is finding a sustainable tempo," Shreya summarized with a nod. "A rhythm where your eyes are always two or three words ahead of your fingers, anticipating the next punctuation mark before your hands even reach for the shift key."\n\n"Exactly right!" Ankit beamed. "Trust your muscle memory, keep your shoulders relaxed, and don\'t let the ticking timer distract your focus. If you stay consistent, the score will take care of itself!"',
  },
];

// ROUND 3: THE TYPING MASTER / FINAL (5 Minutes - Hard)
// Purpose: Speed + Accuracy + Punctuation + Numbers + Concentration.
// A long, realistic narrative/article featuring dates (e.g. 15 September 2026), times (e.g. 9:30 AM, 11:45 AM),
// percentages (e.g. 96.5%, 98.2%), monetary figures ($500, Rs. 25,000), names, quotes, colons, and semicolons.
// Substantially longer for a 5-minute typing test (~2200-2600 chars).
const round3Passages = [
  {
    round: 3,
    title: 'The Championship Finale at TECXEL 2026',
    difficulty: 'hard',
    content: 'On 15 September 2026, the grand finale of the TECXEL Typing Championship commenced at 9:30 AM in the university\'s main auditorium. Over 150 participants from 12 regional colleges had qualified through preliminary heats; now, only the top 50 finalists remained to contest the title. Professor K. S. Raman, Head of the Computer Science Department, welcomed the audience with inspiring remarks: "Today we celebrate more than raw speed; we celebrate discipline, precision, and grace under pressure!"\n\nAt 10:15 AM, the first round had tested baseline cadence. Rahul Sharma, a 3rd-year student from Section A, had clocked an impressive 78.4 WPM with an accuracy rating of 98.2%. His closest competitor, Ananya Patel, finished just behind him at 76.9 WPM and 99.1% accuracy; this gave her a slight edge of 0.35 points in the normalized standings. "That was merely the opening sprint," warned the tournament coordinator, Mr. David Chen; "the final gauntlet will demand five continuous minutes of intense concentration, complex punctuation, and rapid numerical transitions."\n\nBy 11:30 AM, the atmosphere in Lab-4 had grown electric. The scoreboard displayed real-time statistics: total keystrokes across all heats had surpassed 245,000, with an average participant accuracy of 94.6%. The grand prize—a trophy and a cash award of Rs. 25,000, sponsored by TechCorp India—sat proudly on the central stage, catching the bright stage lights.\n\n"Are all contestants logged in and ready?" announced the chief invigilator at 11:45 AM. "Please verify that your participant IDs—ranging from TCX-001 through TCX-050—are active on your terminals." A chorus of enthusiastic responses filled the hall: "Yes, sir!" Rahul adjusted his mechanical keyboard, took two deep breaths, and reminded himself of his coach\'s advice: "Maintain an even tempo: 80% rhythm, 20% reflex; never look down at your hands, and let every period, comma, and dollar sign fall into place naturally." With the countdown clock showing exactly 05:00, the digital signal sounded, and fifty keyboards erupted into a furious, rhythmic symphony of keystrokes.',
  },
  {
    round: 3,
    title: 'The Annual Tech Symposium Report',
    difficulty: 'hard',
    content: 'According to the official symposium summary released on 28 October 2026 at 2:15 PM, the National Student Innovation Summit achieved unprecedented participation. More than 1,200 delegates from 45 institutions gathered at the convention center, registering across 6 major technical tracks: Artificial Intelligence, Cyber Security, Cloud Infrastructure, Robotics, Quantum Computing, and Open-Source Systems. Total project submissions reached 342, representing an overall increase of 28.5% compared to the 2025 conference.\n\nDuring the keynote address delivered at 10:00 AM in Hall-B, Dr. Elena Rostova, Chief Research Scientist at NexaCore Labs, presented compelling data: "Between 2022 and 2026, automated cloud deployments grew by 142.8%; yet, human error accounted for approximately 63.4% of reported security incidents." She emphasized three critical priorities: first, rigorous code reviews; second, comprehensive unit testing with minimum 85% branch coverage; and third, continuous professional training for junior engineers.\n\nAt 3:45 PM, the evaluation committee published the rankings for the competitive programming track. Team Zenith—representing the Institute of Information Technology—secured 1st place with a score of 96.8 points, completing 8 algorithmic problems in just 114 minutes. Their final solution executed in 0.042 seconds, utilizing only 18.6 MB of heap memory. Team Algorists followed in 2nd place with 93.2 points, earning a fellowship grant of $2,500; while Team Phoenix claimed 3rd place with 89.5 points.\n\n"The caliber of engineering displayed today reflects immense dedication," remarked Professor M. K. Iyer during the closing ceremony. "When young builders combine mathematical rigor with clear expression, transformative breakthroughs naturally follow." By 6:00 PM, attendees were exchanging contact details, scheduling collaborative hackathons for November 2026, and celebrating a truly memorable day of collegiate innovation.',
  },
  {
    round: 3,
    title: 'The Autonomous Vehicle Trial of 2026',
    difficulty: 'hard',
    content: 'On Monday, 14 September 2026, the State Department of Transportation conducted Phase-3 field evaluations for its autonomous shuttle initiative. Testing commenced at precisely 8:45 AM along a designated 12.5-kilometer urban corridor. The pilot fleet comprised 4 electric shuttles, each equipped with 8 LiDAR units, 12 ultrasonic proximity sensors, and 6 high-resolution stereo cameras operating at 60 frames per second.\n\nChief Engineer Dr. Sanjay Verma reviewed the telemetry logs at 11:30 AM: "Throughout the morning trials, Shuttle-A2 completed 18 consecutive loops without a single manual intervention; its average cruise velocity was 34.2 km/h, with a maximum recorded braking deceleration of 4.8 m/s²." Over the course of 450 simulated pedestrian crossings, the perception stack maintained an object recognition accuracy of 99.4%, detecting obstacles at an average range of 48.7 meters.\n\nHowever, a slight anomaly occurred at 1:20 PM near the intersection of 5th Avenue and Oak Street: heavy midday glare reduced optical contrast by 14.5%, prompting the onboard guidance system to reduce speed from 40 km/h down to 25 km/h as a precautionary safety protocol. "That is exactly how a defensive autonomous agent should behave," noted Safety Auditor Rachel Adams; "caution must always take precedence over speed!"\n\nTotal operating cost for the 6-hour test window was calculated at $148.50, representing an estimated 62.0% cost reduction compared to conventional fossil-fuel transit. By 4:00 PM, municipal officials announced that public passenger trials would officially launch on 1 December 2026, offering commuters free transit access across 16 major downtown stops.',
  },
  {
    round: 3,
    title: 'The Great Campus Hackathon Milestone',
    difficulty: 'hard',
    content: 'The 36-hour Hack-Fest 2026 concluded on Sunday, 20 September 2026, with an impressive showcase in the indoor sports complex. Beginning on Friday at 8:00 PM, 64 teams—comprising 256 student developers, designers, and domain specialists—worked tirelessly through two full nights. Total lines of source code committed to GitHub exceeded 185,400 across 94 separate repositories, generating 1,420 automated pull requests.\n\nAt 9:15 AM on Sunday morning, the judging panel began reviewing the top 10 finalists. Team CyberShield presented an innovative distributed identity platform designed for university credentials: "By utilizing decentralized identifiers and zero-knowledge proofs, we reduced credential verification latency from 3.5 seconds down to 0.18 seconds; furthermore, data storage requirements dropped by 44.2%!" Their live demonstration impressed all 5 judges, earning an outstanding score of 98.6 out of 100.\n\nSecond place was awarded to Team GreenGrid at 11:30 AM for their smart energy distribution algorithm, which demonstrated potential electricity savings of 18.7% for large campus dormitories. The team received an innovation prize of Rs. 50,000, along with mentorship support from angel investors. Third place went to Team EduPulse with 91.4 points for their accessible learning platform.\n\n"What truly stood out this weekend," remarked Dean of Academic Affairs Dr. Sunita Rao at 1:00 PM, "was not merely the code quality, but the collaborative spirit: over 80% of teams included members from at least two different disciplines." As certificates were distributed, participants celebrated with loud cheers, already looking forward to the 2027 edition.',
  },
  {
    round: 3,
    title: 'The Semiconductor Research Report',
    difficulty: 'hard',
    content: 'In its quarterly research bulletin dated 10 August 2026, the Advanced Microelectronics Laboratory revealed significant progress in sub-2-nanometer transistor fabrication. Led by Dr. Marcus Thorne and a team of 14 postdoctoral researchers, the 18-month project successfully produced a functional 64-bit prototype processor operating stably at 4.25 GHz under standard room-temperature conditions (22.5°C).\n\nKey performance benchmarks highlighted substantial gains: gate switching latency decreased by 19.3%, while active dynamic power consumption dropped from 45.8 Watts to 31.2 Watts—a net efficiency gain of 31.9%. "These measurements confirm our core hypothesis," Dr. Thorne stated during the technical symposium at 2:30 PM; "gate-all-around nanosheet architecture effectively suppresses quantum tunneling leakage, even when channel dimensions contract below 1.8 nm."\n\nThe laboratory\'s testing apparatus ran continuous simulation workloads for 720 hours, recording a mean time between failures (MTBF) exceeding 10,000 hours. The prototype contained approximately 14.8 billion transistors per square centimeter, manufactured using advanced extreme ultraviolet (EUV) lithography with an overlay error margin of less than 0.65 nm.\n\nIndustry analysts estimate that commercial adoption of this technology, slated for early 2028, will yield an economic impact exceeding $45 billion across the server, automotive, and consumer computing sectors. "We are witnessing the dawn of a new computing era," concluded the report; "where efficiency and computing density advance in tandem without exceeding thermal boundaries."',
  },
  {
    round: 3,
    title: 'The College Placement Season Summary',
    difficulty: 'hard',
    content: 'The Training and Placement Cell released its comprehensive placement statistics on 5 October 2026 at 11:00 AM, detailing recruitment outcomes for the graduating class of 2026. A total of 840 eligible students from 8 undergraduate engineering disciplines participated in campus recruitment drives, with 798 students securing confirmed job offers—achieving an overall placement rate of 95.0% within the first 6 weeks.\n\nOver 115 corporate recruiters visited the campus between 1 August and 30 September 2026. The highest international package offered was $125,000 per annum by a leading Silicon Valley software firm, while the highest domestic package reached Rs. 44.5 Lakhs per annum. The median annual salary across all engineering branches climbed to Rs. 9.85 Lakhs, representing a healthy 14.2% increase compared to the 2025 figures.\n\n"We observed particularly strong hiring demand in three specialized domains," explained Placement Director Dr. Rajiv Menon: "Cloud Engineering accounted for 32.5% of total offers; Cyber Security and Data Analytics accounted for 28.0%; and Embedded Systems accounted for 18.5%." Notably, 68 students received dual offers, and 42 students secured funded research internships at overseas universities.\n\nAt 3:30 PM, students celebrated with their mentors and parents outside the administrative block. "Your hard work and disciplined preparation over the past 4 years have yielded fantastic results," said Dr. Menon; "carry this same work ethic forward into your professional careers!"',
  },
  {
    round: 3,
    title: 'The Renewable Microgrid Project',
    difficulty: 'hard',
    content: 'On 22 July 2026 at 10:45 AM, the University Engineering Council commissioned its 1.5-Megawatt hybrid renewable microgrid. Spread across 4 rooftop installations and an open 2-acre field, the facility integrates 3,200 monocrystalline photovoltaic panels with two 500-Kilowatt battery energy storage systems (BESS) based on lithium-iron-phosphate (LFP) chemistry.\n\nDuring initial performance tests conducted between 11:00 AM and 3:00 PM under peak solar irradiance (980 W/m²), the array generated 5,840 Kilowatt-hours of electricity with an inverter conversion efficiency of 98.6%. "By coupling solar generation with intelligent load-shifting algorithms, we can supply 65.0% of the campus\'s daytime electrical demand," explained Project Lead Dr. Anita Desai; "furthermore, surplus energy stored in the batteries can power all library and laboratory lighting between 6:00 PM and 11:00 PM!"\n\nFinancial analysis indicates that the $1.85-million capital investment will break even in approximately 5.8 years, generating annual utility savings of $315,000. Environmental metrics are equally noteworthy: the campus carbon footprint will decrease by an estimated 1,450 metric tons of carbon dioxide annually, equivalent to planting over 62,000 mature pine trees.\n\n"This microgrid is not just an infrastructure upgrade; it is a living laboratory for our undergraduate students," remarked Dean of Engineering Dr. H. C. Joshi during the ribbon-cutting ceremony; "clean energy, smart automation, and practical education have never been more closely aligned."',
  },
  {
    round: 3,
    title: 'The Cybersecurity Defense Exercise',
    difficulty: 'hard',
    content: 'On Friday, 18 September 2026, the Department of Information Technology hosted Cyber-Shield 2026, an intensive 8-hour simulated defensive exercise. Commencing at 9:00 AM in the network simulation lab, 20 defense teams (Blue Teams) worked to protect simulated enterprise networks from sophisticated adversarial attacks orchestrated by a veteran penetration-testing team (Red Team).\n\nOver the course of the simulation, the Red Team launched 128 distinct multi-stage attacks: 45 targeted phishing campaigns, 38 distributed denial-of-service (DDoS) spikes peaking at 12.8 Gbps, 27 SQL injection exploits, and 18 credential-stuffing sweeps utilizing leaked credential databases. "The key to effective cyber resilience is rapid detection and containment," stated Chief Controller Major Vikram Singh at 1:15 PM; "a team that detects an intrusion within 5 minutes can isolate the subnet before lateral movement occurs!"\n\nTeam Aegis—led by final-year students Aditya Sharma and Neha Verma—claimed 1st place with a final defense score of 97.2 points out of 100. They detected 96.0% of hostile intrusion vectors within an average time of 2.4 minutes, successfully neutralizing all ransomware payloads without suffering any data exfiltration. Team Sentinel followed closely in 2nd place with 93.8 points, while Team Bastion placed 3rd with 88.5 points.\n\nAt 5:30 PM, all participants gathered for a comprehensive debriefing session: "Today proved that technology alone is insufficient; informed vigilance, precise teamwork, and swift analytical thinking remain our strongest defense!"',
  },
  {
    round: 3,
    title: 'The Mars Rover Prototype Testing',
    difficulty: 'hard',
    content: 'On 29 August 2026 at 7:30 AM, student engineers from the Interdisciplinary Robotics Club commenced full-scale terrain testing of their rover prototype, designated Astra-VI. The outdoor testing ground, located in a rugged sandstone quarry 35 kilometers outside the city, closely simulates the rough, boulder-strewn Martian surface found at Jezero Crater.\n\nWeighing 48.5 kilograms, the rover features a six-wheel rocker-bogie suspension system powered by six independent 24-Volt brushless DC motors. Over a grueling 4-hour navigation course, Astra-VI crossed 3.2 kilometers of loose gravel, climbed steep 28-degree inclines, and maneuvered around 45 rocky obstacles with an average speed of 0.85 km/h.\n\n"Telemetry confirmed that our autonomous pathfinding module performed exceptionally well," reported Navigation Lead Siddharth Patel at 11:45 AM. "The stereo cameras mapped 3D terrain hazards at 15 frames per second, allowing the path planner to calculate optimal routes within 42 milliseconds; wheel slippage remained below 8.5% throughout the climb."\n\nTotal power consumed during the 4-hour trial was 385 Watt-hours, leaving 45.0% reserve capacity in the onboard lithium-ion battery pack. The robotic sampling arm successfully retrieved three geological core specimens, depositing them into sterile containers with a precision margin of 1.2 millimeters. "This was our most challenging field test to date," beamed Team Captain Ananya Bose; "the data gathered today proves our rover is ready for the International University Rover Challenge in June 2027!"',
  },
  {
    round: 3,
    title: 'The AI Healthcare Conference',
    difficulty: 'hard',
    content: 'On 12 October 2026, the Global Healthcare Informatics Summit opened at 9:00 AM at the Convention Palace. More than 850 medical professionals, clinical researchers, and software engineers gathered to review groundbreaking applications of machine learning in early disease detection. Across 24 technical papers presented, researchers demonstrated how deep-learning models could assist radiologists in detecting early-stage pulmonary nodules with 97.8% sensitivity and 95.4% specificity.\n\nDuring the keynote address delivered at 10:30 AM, Dr. Aris Thorne presented data from a multi-center clinical study involving 14,200 patient scans across 6 regional hospitals: "When medical specialists collaborated with AI diagnostic tools, diagnostic turnaround times dropped from 48 hours down to 6.5 hours—a net improvement of 86.5%; furthermore, false-negative rates decreased by 34.2%."\n\nDr. Thorne stressed the paramount importance of data ethics: "Every clinical dataset must undergo rigorous anonymization; patient privacy cannot be compromised under any circumstance. Model interpretability—knowing exactly why an algorithm flagged a specific scan—is essential for building clinical trust."\n\nAt 2:45 PM, the summit hosted a student research symposium where 15 university teams presented clinical software prototypes. The 1st prize of $5,000 was awarded to Team BioVision for their real-time diabetic retinopathy screening tool, which runs on low-cost smartphones without requiring continuous internet connectivity. "When technology serves humanity with compassion and scientific rigor," concluded the closing panel at 5:00 PM, "we can deliver world-class diagnostic care to millions of underserved patients worldwide."',
  },
];

async function seedData() {
  if (mongoose.connection.readyState === 0) {
    await connectDB();
  }
  console.log('[Seed] Seeding passages and admin...');

  // Clear existing passages and seed fresh 10+ per round
  await Passage.deleteMany({});
  const allPassages = [...round1Passages, ...round2Passages, ...round3Passages];
  const insertedPassages = await Passage.insertMany(allPassages);
  console.log(`[Seed] Successfully inserted ${insertedPassages.length} passages (10 per round).`);

  // Seed default admin if missing
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@tecxl.com').toLowerCase();
  const existingAdmin = await Admin.findOne({ email: adminEmail });
  if (!existingAdmin) {
    const defaultPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);
    await Admin.create({
      email: adminEmail,
      password: hashedPassword,
      role: 'superadmin',
    });
    console.log(`[Seed] Created default admin account: ${adminEmail} / ${defaultPassword}`);
  } else {
    console.log(`[Seed] Default admin account already exists: ${adminEmail}`);
  }

  console.log('[Seed] Database seeding complete.');
}

if (require.main === module) {
  seedData()
    .then(() => {
      console.log('[Seed] Finished.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seed] Error seeding data:', err);
      process.exit(1);
    });
}

module.exports = seedData;
