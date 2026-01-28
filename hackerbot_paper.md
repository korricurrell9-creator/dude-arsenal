# Hackerbot: Attacker Chatbots for Randomised and Interactive Security Labs

## Abstract
Hackerbot is an automated adversary used in education. It attacks student VMs and challenges them to defend or investigate. It uses **SecGen** for randomization and **oVirt** for infrastructure.

## Key Concepts for OMEGA CORE
1.  **Automated Adversary**: The bot doesn't just scan; it actively exploits (Metasploit) and post-exploits (file creation, modification).
2.  **Chatbot C2**: Uses IRC/IM (Pidgin) to interact with the target. It warns of attacks or demands flags.
3.  **Randomization (SecGen)**:
    - Unique vulnerabilities per target.
    - Dynamic flag generation.
    - Prevents pattern matching by static defense tools.
4.  **Attack Lifecycle**:
    - **Pre-shell**: Nmap scans, port checks.
    - **Get-shell**: Exploit launching (e.g., `distcc_exec`).
    - **Post-command**: Exfiltration, installing backdoors, creating noise.
5.  **Verification**: The bot checks the exit code of its attack commands to see if the target is vulnerable.

## Strategic Value
- We can reverse-engineer the "Condition/Response" logic.
- If we detect a "Hackerbot" style interaction, we know we are in a training environment (Honey Pot detection).
- We can adopt the **SecGen** approach to randomize our `dude_slai_bot` payloads so IDS (Intrusion Detection Systems) can't fingerprint us easily.

## Technical Implementation (Ruby/AIML)
- Uses **Cinch framework** for IRC.
- Uses **Programr** for AIML (AI Markup Language) chat responses.
- Attacks are defined in XML with `<pre_shell>`, `<get_shell>`, and `<post_command>` tags.
