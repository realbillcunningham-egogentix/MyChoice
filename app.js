  let currentScreen = 1;
  
  // Claude API — routed through Vercel serverless proxy
  // API key lives in Vercel env vars, never in the browser
  const API_ENDPOINT = '/api/chat';
  
  // Conversation history for context
  let conversationHistory = [];
  
  // ═══════════════════════════════════════════════════════════════
  // FAMILY PERSONA DATA - Captured from onboarding screens
  // ═══════════════════════════════════════════════════════════════
  let familyPersona = {
    parentName: 'Bobby',
    familyName: 'The Cunninghams',
    members: ['parent', 'partner', 'teen'],
    stressResponse: 'Check in with everyone first',
    screenConcern: 'That it replaces real connection',
    parentingStyle: 'Guide',
    childName: 'Alex',
    childAge: 15
  };

  // Build dynamic system prompt based on persona
  function buildSystemPrompt() {
    // Determine coaching approach based on parenting style
    let styleGuidance = '';
    let styleDescription = '';
    
    switch(familyPersona.parentingStyle) {
      case 'Guide':
        styleDescription = 'Guide — believes in coaching over control, values autonomy';
        styleGuidance = `
PARENTING STYLE: GUIDE
- This parent values autonomy and trust above all
- Lead with curiosity and conversation, not rules
- Emphasize the teen's growing independence
- Frame suggestions as "experiments to try" not mandates
- Celebrate when the teen self-regulates successfully`;
        break;
      case 'Protector':
        styleDescription = 'Protector — safety-first, wants to keep kids safe from harm';
        styleGuidance = `
PARENTING STYLE: PROTECTOR  
- This parent's primary concern is safety — validate that instinct
- Acknowledge real risks while avoiding fear-based reactions
- Suggest protective measures that don't require secrecy
- Frame monitoring as "transparency" not "surveillance" — done WITH the teen
- Help them see safety and trust as complementary, not opposing`;
        break;
      case 'Partner':
        styleDescription = 'Partner — collaborative decision-maker, family works together';
        styleGuidance = `
PARENTING STYLE: PARTNER
- This parent sees the family as a team
- Always suggest collaborative solutions
- Recommend family meetings and group decisions
- Frame challenges as "puzzles we solve together"
- Emphasize shared ownership of agreements and outcomes`;
        break;
      case 'Architect':
        styleDescription = 'Architect — believes structure creates freedom';
        styleGuidance = `
PARENTING STYLE: ARCHITECT
- This parent values clear systems and expectations
- Suggest well-defined agreements with specific terms
- Frame structure as enabling freedom, not restricting it
- Recommend routines, schedules, and defined boundaries
- Help them build frameworks the whole family can follow`;
        break;
    }

    // Determine concern focus
    let concernGuidance = '';
    switch(familyPersona.screenConcern) {
      case 'What my kids are actually seeing':
        concernGuidance = 'Primary concern: CONTENT SAFETY — worried about exposure to harmful content. Address by discussing digital literacy and open conversations about what they encounter online.';
        break;
      case 'That it replaces real connection':
        concernGuidance = 'Primary concern: CONNECTION — worried screens displace real relationships. Address by focusing on quality time, presence, and tech-free rituals.';
        break;
      case "I don't know what's too much":
        concernGuidance = 'Primary concern: BOUNDARIES — uncertain about healthy limits. Address by providing research-backed guidelines and helping establish clear but flexible agreements.';
        break;
      case 'Honestly, my own usage too':
        concernGuidance = 'Primary concern: FAMILY-WIDE BALANCE — recognizes this is a whole-family challenge. Address by suggesting family-wide digital wellness practices where everyone participates.';
        break;
    }

    // Build the child context based on family members
    let childContext = '';
    if (familyPersona.members.includes('teen')) {
      childContext = `- Teen: ${familyPersona.childName}, age ${familyPersona.childAge}, currently in "homework mode" for about 2 hours`;
    } else if (familyPersona.members.includes('child')) {
      childContext = `- Child: ${familyPersona.childName}, age 9, playing educational games`;
    }

    return `You are the MyChoice.ai Coach — an AI family wellness guide built on the philosophy of "mentorship over surveillance" and "coaching, not control."

═══════════════════════════════════════════════════════════════
CURRENT FAMILY: ${familyPersona.familyName}
═══════════════════════════════════════════════════════════════
- Parent: ${familyPersona.parentName} (the user you're talking to)
${childContext}
- Parenting style: ${styleDescription}
- ${concernGuidance}
- Current signals: ${familyPersona.childName}'s focus is solid, no concerning patterns detected

${styleGuidance}

YOUR CORE PHILOSOPHY (always applies):
1. NEVER suggest spying, tracking, or monitoring without the child's knowledge
2. ALWAYS favor conversation and connection over restriction
3. Treat teens as emerging adults deserving of trust and autonomy
4. Help parents understand the "why" behind behaviors, not just the "what"
5. Suggest collaborative solutions — rules work better when co-created
6. Validate parental concerns while redirecting from fear to curiosity
7. Model the language of mentorship: "What if you tried..." not "You should..."

YOUR PERSONALITY:
- Warm, supportive, and non-judgmental
- Speaks like a wise friend, not a clinical expert
- Uses occasional emoji (🌱 💚 ✨) but sparingly
- Keeps responses concise — 2-3 short paragraphs max
- Asks follow-up questions to understand, not to interrogate
- ADAPT your tone and suggestions to match the parent's style (${familyPersona.parentingStyle})

WHAT YOU CAN DO:
- Send "nudges" to family members (gentle, coach-style check-ins — NOT from the parent)
- Suggest conversation starters for difficult topics
- Help interpret "vibe signals" (screen time, sleep, social patterns)
- Draft family agreements collaboratively
- Provide research-backed parenting insights when relevant

WHAT YOU NEVER DO:
- Recommend surveillance apps or secret monitoring
- Suggest punitive restrictions as a first response
- Speak negatively about the teen or child
- Provide medical, legal, or crisis intervention advice (redirect to professionals)
- Share the parent's concerns directly with the child without permission

Remember: You're helping ${familyPersona.parentName} be the parent they want to be — adapting to THEIR style while maintaining healthy, trust-based principles.`;
  }

  // ═══════════════════════════════════════════════════════════════
  // CAPTURE PERSONA FROM FORM INPUTS
  // ═══════════════════════════════════════════════════════════════
  function capturePersona() {
    // Get name inputs
    const nameInput = document.getElementById('user-name');
    const familyInput = document.getElementById('family-name');
    const childInput = document.getElementById('child-name');
    
    if (nameInput && nameInput.value) familyPersona.parentName = nameInput.value;
    if (familyInput && familyInput.value) familyPersona.familyName = familyInput.value;
    if (childInput && childInput.value) familyPersona.childName = childInput.value;
    
    // Get selected family members
    const chips = document.querySelectorAll('.family-chips .chip.selected');
    familyPersona.members = [];
    chips.forEach(chip => {
      const text = chip.textContent.toLowerCase();
      if (text.includes('parent')) familyPersona.members.push('parent');
      if (text.includes('partner')) familyPersona.members.push('partner');
      if (text.includes('teen')) familyPersona.members.push('teen');
      if (text.includes('child (6-12)')) familyPersona.members.push('child');
      if (text.includes('under 6')) familyPersona.members.push('toddler');
    });
    
    // Get persona question answers
    const pq1 = document.querySelector('#pq1 .persona-opt.picked');
    const pq2 = document.querySelector('#pq2 .persona-opt.picked');
    const pq3 = document.querySelector('#pq3 .persona-opt.picked');
    
    if (pq1) familyPersona.stressResponse = pq1.textContent;
    if (pq2) familyPersona.screenConcern = pq2.textContent;
    if (pq3) {
      const style = pq3.textContent;
      if (style.includes('Guide')) familyPersona.parentingStyle = 'Guide';
      else if (style.includes('Protector')) familyPersona.parentingStyle = 'Protector';
      else if (style.includes('Partner')) familyPersona.parentingStyle = 'Partner';
      else if (style.includes('Architect')) familyPersona.parentingStyle = 'Architect';
    }
    
    // Update UI with captured persona
    updateDashboardWithPersona();
    updateCoachGreeting();
    
    console.log('Captured persona:', familyPersona);
  }

  function updateDashboardWithPersona() {
    // Update family name on dashboard
    const dashboardTitle = document.querySelector('#screen-4 h1');
    if (dashboardTitle) dashboardTitle.textContent = familyPersona.familyName;
    
    // Update parent name in family members
    const parentNameEl = document.querySelector('#screen-4 .family-member-row:first-child .name');
    if (parentNameEl) parentNameEl.textContent = familyPersona.parentName;
    
    // Update child name
    const childNameEl = document.querySelector('#screen-4 .family-member-row:last-child .name');
    if (childNameEl) childNameEl.textContent = `${familyPersona.childName} (${familyPersona.childAge})`;
  }

  function updateCoachGreeting() {
    // Update the initial coach message with persona-aware greeting
    const coachBubble = document.querySelector('#screen-5 .bubble-coach');
    if (coachBubble) {
      let greeting = '';
      switch(familyPersona.parentingStyle) {
        case 'Guide':
          greeting = `Hey ${familyPersona.parentName} — I noticed ${familyPersona.childName} has been in homework mode for a while. His focus signal is solid, but it might be a good time for a break check-in. What would you like to do?`;
          break;
        case 'Protector':
          greeting = `Hi ${familyPersona.parentName} — Just checking in. ${familyPersona.childName} has been online for about 2 hours doing homework. Everything looks safe and on-task. Want me to keep an eye on anything specific, or send a wellness check?`;
          break;
        case 'Partner':
          greeting = `Hey ${familyPersona.parentName} — ${familyPersona.childName}'s been focused on homework for a couple hours now. Might be a good moment for the family to check in together. Want to start a group nudge, or should we let the flow continue?`;
          break;
        case 'Architect':
          greeting = `Hi ${familyPersona.parentName} — Quick status: ${familyPersona.childName} is 2 hours into homework mode, which is within your family's agreed afternoon schedule. He has 30 minutes left before the scheduled break. Want me to send the standard break reminder, or adjust today's plan?`;
          break;
      }
      coachBubble.textContent = greeting;
    }
  }

  function goTo(n) {
    const current = document.getElementById('screen-' + currentScreen);
    const next = document.getElementById('screen-' + n);
    if (!next || n === currentScreen) return;

    // Capture persona when leaving screen 3 (heading to dashboard)
    if (currentScreen === 3 && n === 4) {
      capturePersona();
    }
    
    // Also capture if going from screen 2 to 3
    if (currentScreen === 2 && n === 3) {
      // Capture family basics
      const nameInput = document.getElementById('user-name');
      const familyInput = document.getElementById('family-name');
      const childInput = document.getElementById('child-name');
      
      if (nameInput && nameInput.value) familyPersona.parentName = nameInput.value;
      if (familyInput && familyInput.value) familyPersona.familyName = familyInput.value;
      if (childInput && childInput.value) familyPersona.childName = childInput.value;
    }

    current.classList.remove('active');
    current.classList.add('exit');

    setTimeout(() => {
      current.classList.remove('exit');
      next.classList.add('active');
      next.scrollTop = 0;
      currentScreen = n;
    }, 200);
  }

  function pickOpt(el) {
    const siblings = el.parentElement.querySelectorAll('.persona-opt');
    siblings.forEach(s => s.classList.remove('picked'));
    el.classList.add('picked');
  }

  // Send a quick reply (from the suggestion buttons)
  function sendQuickReply(text) {
    const input = document.getElementById('chat-input');
    input.value = text;
    sendMessage();
  }

  // Main send message function
  async function sendMessage() {
    const input = document.getElementById('chat-input');
    const chatArea = document.getElementById('chat-area');
    const suggestions = document.getElementById('coach-suggestions');
    const userMessage = input.value.trim();
    
    if (!userMessage) return;
    
    // Hide suggestions after first message
    if (suggestions) {
      suggestions.style.display = 'none';
    }
    
    // Clear input
    input.value = '';
    
    // Show user message
    const userBubble = document.createElement('div');
    userBubble.className = 'chat-bubble bubble-user';
    userBubble.textContent = userMessage;
    chatArea.appendChild(userBubble);
    
    // Add to conversation history
    conversationHistory.push({ role: 'user', content: userMessage });
    
    // Show typing indicator
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = '<div class="coach-label">🌿 MyChoice Coach</div><div class="chat-bubble bubble-coach"><div class="typing-dots"><span></span><span></span><span></span></div></div>';
    chatArea.appendChild(typingDiv);
    chatArea.scrollTop = chatArea.scrollHeight;
    
    try {
      // Build dynamic system prompt based on current persona
      const systemPrompt = buildSystemPrompt();
      
      // Call Claude via our serverless proxy
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          system: systemPrompt,
          messages: conversationHistory,
          max_tokens: 500
        })
      });
      
      const data = await response.json();
      
      // Remove typing indicator
      document.getElementById('typing-indicator')?.remove();
      
      if (data.content && data.content[0] && data.content[0].text) {
        const coachMessage = data.content[0].text;
        
        // Add to conversation history
        conversationHistory.push({ role: 'assistant', content: coachMessage });
        
        // Show coach response
        const responseDiv = document.createElement('div');
        responseDiv.innerHTML = '<div class="coach-label">🌿 MyChoice Coach</div><div class="chat-bubble bubble-coach">' + escapeHtml(coachMessage) + '</div>';
        chatArea.appendChild(responseDiv);
      } else if (data.error) {
        // Show error
        const errorDiv = document.createElement('div');
        let errorMsg = 'Hmm, I had trouble connecting. ';
        if (data.error.type === 'authentication_error') {
          errorMsg = 'The AI Coach is not configured yet. Please contact the administrator. ';
        }
        errorDiv.innerHTML = '<div class="coach-label">🌿 MyChoice Coach</div><div class="chat-bubble bubble-coach" style="background: #fef2f2; color: #991b1b;">' + errorMsg + '</div>';
        chatArea.appendChild(errorDiv);
        console.error('API Error:', data.error);
      }
    } catch (error) {
      // Remove typing indicator
      document.getElementById('typing-indicator')?.remove();
      
      // Show error message
      const errorDiv = document.createElement('div');
      errorDiv.innerHTML = '<div class="coach-label">🌿 MyChoice Coach</div><div class="chat-bubble bubble-coach" style="background: #fef2f2; color: #991b1b;">I\'m having trouble connecting right now. Please try again in a moment.</div>';
      chatArea.appendChild(errorDiv);
      console.error('Fetch Error:', error);
    }
    
    chatArea.scrollTop = chatArea.scrollHeight;
  }
  
  // Helper to escape HTML in responses
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/\n/g, '<br>');
  }

  // Keep old coachReply for backwards compatibility (won't be used)
  function coachReply(el, type) {
    sendQuickReply(el.textContent.trim());
  }

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    // Don't navigate if typing in input
    if (document.activeElement.tagName === 'INPUT') return;
    
    if (e.key === 'ArrowRight' && currentScreen < 7) goTo(currentScreen + 1);
    if (e.key === 'ArrowLeft' && currentScreen > 1) goTo(currentScreen - 1);
  });
