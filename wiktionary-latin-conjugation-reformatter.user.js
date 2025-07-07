// ==UserScript==
// @name         Wiktionary Latin Conjugation Reformatter
// @namespace    https://github.com/InvictusNavarchus/
// @updateURL    https://raw.githubusercontent.com/InvictusNavarchus/wiktionary-latin-conjugation-reformatter/master/wiktionary-latin-conjugation-reformatter.user.js
// @downloadURL  https://raw.githubusercontent.com/InvictusNavarchus/wiktionary-latin-conjugation-reformatter/master/wiktionary-latin-conjugation-reformatter.user.js
// @version      0.1.0
// @description  Transforms the cluttered Wiktionary Latin conjugation table into a more readable, spacious format.
// @author       Invictus Navarchus
// @match        https://en.wiktionary.org/wiki/*
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(function() {
    'use strict';

    // --- SCRIPT CONFIGURATION ---
    const SCRIPT_NAME = "Wiktionary Latin Reformatter";
    const SCRIPT_EMOJI = "🏛️";
    const IS_NEW_VIEW_DEFAULT = true;

    // --- UTILITIES ---

    /**
     * Creates a standardized prefix for console logs.
     * @returns {string} The formatted log prefix.
     */
    function getPrefix() {
        const now = new Date();
        const time = now.toTimeString().split(' ')[0];
        return `[${SCRIPT_NAME} ${SCRIPT_EMOJI} ${time}]`;
    }

    console.log(getPrefix(), "Script loaded and running (v2.1).");

    // --- STYLES ---
    const newStyles = `
        .wikt-reformat-container {
            font-family: sans-serif;
            margin-top: 1em;
            border: 1px solid #a2a9b1;
            border-radius: 4px;
            overflow: hidden;
            background-color: #f8f9fa;
        }
        .wikt-reformat-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 15px;
            background-color: #eaecf0;
            border-bottom: 1px solid #a2a9b1;
        }
        .wikt-reformat-header-standalone {
            border-bottom: none;
        }
        .wikt-reformat-title {
            font-size: 1.2em;
            font-weight: bold;
            color: #202122;
        }
        .wikt-reformat-toggle-btn {
            background-color: #36c;
            color: white;
            border: 1px solid #36c;
            padding: 8px 12px;
            border-radius: 2px;
            cursor: pointer;
            font-size: 0.9em;
            transition: background-color 0.2s;
        }
        .wikt-reformat-toggle-btn:hover {
            background-color: #447ff5;
        }
        .wikt-reformat-body {
            padding: 15px;
        }
        .wikt-reformat-mood-container {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        .wikt-reformat-voice-section {
            display: flex;
            flex-direction: column;
            margin-bottom: 20px;
        }
        .wikt-reformat-voice-header {
            background-color: #2980b9;
            color: white;
            padding: 8px;
            font-weight: bold;
            text-align: center;
            border-radius: 4px;
            margin-bottom: 10px;
            text-transform: uppercase;
            font-size: 1.1em;
        }
        .wikt-reformat-voice-columns {
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
        }
        .wikt-reformat-mood-title {
            width: 100%;
            background-color: #c0392b;
            color: white;
            padding: 10px;
            font-weight: bold;
            text-align: center;
            border-radius: 4px;
            margin-top: 15px;
            margin-bottom: 10px;
            font-size: 1.2em;
            text-transform: uppercase;
        }
        .wikt-reformat-column {
            flex: 1;
            min-width: 320px;
        }
        .wikt-reformat-tense-title {
            width: 100%;
            background-color: #27ae60;
            color: white;
            padding: 8px;
            font-weight: bold;
            text-align: center;
            border-radius: 4px;
            margin-bottom: 5px;
            text-transform: uppercase;
            font-size: 1em;
        }
        .wikt-reformat-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
            border: 1px solid #ddd;
        }
        .wikt-reformat-table td {
            padding: 9px 12px;
            border: none;
        }
        .wikt-reformat-table tr {
            border-bottom: 1px solid #ddd;
        }
        .wikt-reformat-table tr:last-child {
            border-bottom: none;
        }
        .wikt-reformat-table tr:nth-child(odd) {
            background-color: #ffffff;
        }
        .wikt-reformat-table tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .wikt-reformat-person-col {
            width: 35%;
            font-weight: bold;
            color: #333;
        }
        .wikt-reformat-form-col {
            width: 65%;
            font-family: "Linux Libertine", "Georgia", "Times", serif;
            font-size: 1.1em;
        }
        .wikt-reformat-form-col a {
            color: #0645ad;
            text-decoration: none;
        }
        .wikt-reformat-form-col a:hover {
            text-decoration: underline;
        }
        .wikt-reformat-nonfinite-section {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            margin-top: 15px;
        }
        .wikt-reformat-nonfinite-group {
            flex: 1;
            min-width: 250px;
        }
    `;
    GM_addStyle(newStyles);

    /**
     * Main function to find and reformat the conjugation table.
     */
    function runReformatter() {
        console.log(getPrefix(), "Running reformatter...");
        const conjugationHeader = document.getElementById('Conjugation');
        if (!conjugationHeader) {
            console.error(getPrefix(), "Could not find the 'Conjugation' header (ID: #Conjugation).");
            return;
        }
        console.log(getPrefix(), "Found 'Conjugation' header.");

        const headingDiv = conjugationHeader.parentElement;
        if (!headingDiv) {
            console.error(getPrefix(), "Could not find parent of conjugation header.");
            return;
        }

        // CORRECTED LOGIC: Find the next sibling element that is a .NavFrame
        let originalContainer = headingDiv.nextElementSibling;
        while (originalContainer && !originalContainer.classList.contains('NavFrame')) {
            originalContainer = originalContainer.nextElementSibling;
        }

        if (!originalContainer) {
            console.error(getPrefix(), "Could not find the original table container (.NavFrame) as a sibling of the header div. Aborting.");
            return;
        }
        console.log(getPrefix(), "Successfully found original table container (.NavFrame).");

        const originalTable = originalContainer.querySelector('.roa-inflection-table');
        if (!originalTable) {
            console.error(getPrefix(), "Could not find the inflection table (.roa-inflection-table).");
            return;
        }
        console.log(getPrefix(), "Found original inflection table.");

        if (originalContainer.dataset.reformatted) {
            console.log(getPrefix(), "Table already reformatted. Skipping.");
            return;
        }
        originalContainer.dataset.reformatted = 'true';

        console.log(getPrefix(), "Starting to parse Wiktionary table...");
        const conjugationData = parseWiktionaryTable(originalTable);
        console.log(getPrefix(), "Finished parsing. Data:", conjugationData);

        console.log(getPrefix(), "Creating new reformatted view...");
        const newTableContainer = createReformattedView(conjugationData);
        console.log(getPrefix(), "Finished creating new view.");

        originalContainer.parentNode.insertBefore(newTableContainer, originalContainer);
        console.log(getPrefix(), "New view inserted into the page.");

        setupToggle(originalContainer, newTableContainer);
    }

    /**
     * Parses the Wiktionary conjugation table and extracts conjugation data.
     * @param {HTMLElement} table - The conjugation table element
     * @returns {Object} Parsed conjugation data organized by mood, voice, and tense
     */
    function parseWiktionaryTable(table) {
        const data = {
            indicative: { active: {}, passive: {} },
            subjunctive: { active: {}, passive: {} },
            imperative: { active: {}, passive: {} },
            nonFinite: {
                infinitive: {}, participle: {}, gerund: {}, supine: {}
            }
        };
        const rows = Array.from(table.querySelectorAll('tbody > tr'));
        let currentMood = '', currentVoice = '';

        console.log(getPrefix(), `Processing ${rows.length} table rows...`);

        rows.forEach((row, index) => {
            const headers = Array.from(row.querySelectorAll('th'));
            console.log(getPrefix(), `Row ${index}: ${headers.length} headers, mood: ${currentMood}, voice: ${currentVoice}`);
            
            // Skip rows with no headers and no current context
            if (headers.length === 0) {
                console.log(getPrefix(), `Row ${index}: Skipping - no headers and no context`);
                return;
            }

            const firstHeaderClass = headers[0].className;
            
            // Check for mood changes
            if (firstHeaderClass.includes('roa-indicative-left-rail')) {
                currentMood = 'indicative';
                console.log(getPrefix(), `Row ${index}: Set mood to indicative`);
            } else if (firstHeaderClass.includes('roa-subjunctive-left-rail')) {
                currentMood = 'subjunctive';
                console.log(getPrefix(), `Row ${index}: Set mood to subjunctive`);
            } else if (firstHeaderClass.includes('roa-imperative-left-rail')) {
                currentMood = 'imperative';
                console.log(getPrefix(), `Row ${index}: Set mood to imperative`);
            } else if (firstHeaderClass.includes('roa-nonfinite-header')) {
                console.log(getPrefix(), `Row ${index}: Processing non-finite forms`);
                handleNonFinite(row, data.nonFinite);
                return;
            }

            // Process voice and tense information
            if (headers.length >= 2) {
                // Row with voice + tense (e.g., "active" + "present")
                const voiceHeader = headers[0].textContent.trim().toLowerCase();
                if (voiceHeader === 'active' || voiceHeader === 'passive') {
                    currentVoice = voiceHeader;
                    console.log(getPrefix(), `Row ${index}: Set voice to ${currentVoice}`);
                }

                const tenseHeader = headers[1].textContent.trim().toLowerCase()
                    .replace(/\s+/g, '')
                    .replace(/&nbsp;/g, '');
                console.log(getPrefix(), `Row ${index}: Parsed tense header: "${tenseHeader}" from "${headers[1].textContent}"`);
                if (currentMood && currentVoice && data[currentMood]?.[currentVoice] && tenseHeader) {
                    const forms = extractForms(row.querySelectorAll('td'));
                    data[currentMood][currentVoice][tenseHeader] = forms;
                    console.log(getPrefix(), `Row ${index}: Stored ${Object.keys(forms).length} forms for ${currentMood}.${currentVoice}.${tenseHeader}`);
                }
            } else if (headers.length === 1 && currentMood && currentVoice) {
                // Row with only tense (e.g., "imperfect", "future", "perfect")
                const tenseHeader = headers[0].textContent.trim().toLowerCase()
                    .replace(/\s+/g, '')
                    .replace(/&nbsp;/g, '');
                console.log(getPrefix(), `Row ${index}: Parsed tense header: "${tenseHeader}" from "${headers[0].textContent}"`);
                if (data[currentMood]?.[currentVoice] && tenseHeader) {
                    const forms = extractForms(row.querySelectorAll('td'));
                    data[currentMood][currentVoice][tenseHeader] = forms;
                    console.log(getPrefix(), `Row ${index}: Stored ${Object.keys(forms).length} forms for ${currentMood}.${currentVoice}.${tenseHeader}`);
                }
            }
        });
        
        console.log(getPrefix(), "Parsing complete. Final data structure:", data);
        // log stringified data for debugging
        console.log(getPrefix(), "Stringified Final data structure:", JSON.stringify(data));
        return data;
    }

    /**
     * Extracts verb forms from table cells and maps them to person/number combinations.
     * @param {NodeList} cells - The table cells containing verb forms
     * @returns {Object} Object mapping person/number to verb forms
     */
    function extractForms(cells) {
        const forms = {};
        const persons = ['1s', '2s', '3s', '1p', '2p', '3p'];
        Array.from(cells).forEach((cell, index) => {
            if (index < persons.length && cell.innerHTML.trim() !== '—') {
                forms[persons[index]] = cell.innerHTML;
            }
        });
        console.log(getPrefix(), `Extracted forms: ${Object.keys(forms).join(', ')}`);
        return forms;
    }

    function handleNonFinite(row, nonFiniteData) {
        const headers = row.querySelectorAll('th');
        const cells = row.querySelectorAll('td');
        const tense = headers[1]?.textContent.trim().toLowerCase().replace(/\s+/g, '');
        if (!tense) return;

        if (headers.length === 2 && cells.length === 4) { // Infinitive, Participle
            nonFiniteData.infinitive[tense + 'Active'] = cells[0].innerHTML;
            nonFiniteData.infinitive[tense + 'Passive'] = cells[1].innerHTML;
            nonFiniteData.participle[tense + 'Active'] = cells[2].innerHTML;
            nonFiniteData.participle[tense + 'Passive'] = cells[3].innerHTML;
        } else if (headers.length === 3 && cells.length === 4) { // Gerund
            nonFiniteData.gerund.genitive = cells[0].innerHTML;
            nonFiniteData.gerund.dative = cells[1].innerHTML;
            nonFiniteData.gerund.accusative = cells[2].innerHTML;
            nonFiniteData.gerund.ablative = cells[3].innerHTML;
        } else if (headers.length === 3 && cells.length === 2) { // Supine
            nonFiniteData.supine.accusative = cells[0].innerHTML;
            nonFiniteData.supine.ablative = cells[1].innerHTML;
        }
    }

    function createReformattedView(data) {
        const container = document.createElement('div');
        container.className = 'wikt-reformat-container';
        const body = document.createElement('div');
        body.className = 'wikt-reformat-body';

        body.appendChild(createMoodSection('INDICATIVE', data.indicative));
        body.appendChild(createMoodSection('SUBJUNCTIVE', data.subjunctive));

        const otherFormsSection = document.createElement('div');
        otherFormsSection.className = 'wikt-reformat-nonfinite-section';
        otherFormsSection.appendChild(createImperativeGroup(data.imperative));
        otherFormsSection.appendChild(createNonFiniteGroup('INFINITIVE', data.nonFinite.infinitive, {
            presentActive: 'Present Active', perfectActive: 'Perfect Active', futureActive: 'Future Active',
            presentPassive: 'Present Passive', perfectPassive: 'Perfect Passive', futurePassive: 'Future Passive'
        }));
        otherFormsSection.appendChild(createNonFiniteGroup('PARTICIPLE', data.nonFinite.participle, {
            presentActive: 'Present Active', futureActive: 'Future Active',
            perfectPassive: 'Perfect Passive', futurePassive: 'Future Passive (Gerundive)'
        }));
        otherFormsSection.appendChild(createNonFiniteGroup('GERUND', data.nonFinite.gerund, {
            genitive: 'Genitive', dative: 'Dative', accusative: 'Accusative', ablative: 'Ablative'
        }));
        otherFormsSection.appendChild(createNonFiniteGroup('SUPINE', data.nonFinite.supine, {
            accusative: 'Accusative', ablative: 'Ablative'
        }));

        body.appendChild(otherFormsSection);
        container.appendChild(body);
        return container;
    }

    function createMoodSection(title, moodData) {
        const section = document.createElement('div');
        section.style.width = '100%';
        const moodTitle = document.createElement('div');
        moodTitle.className = 'wikt-reformat-mood-title';
        moodTitle.textContent = title;
        section.appendChild(moodTitle);

        const container = document.createElement('div');
        container.className = 'wikt-reformat-mood-container';

        // Active Voice Section
        const activeSection = document.createElement('div');
        activeSection.className = 'wikt-reformat-voice-section';
        
        const activeHeader = document.createElement('div');
        activeHeader.className = 'wikt-reformat-voice-header';
        activeHeader.textContent = 'ACTIVE';
        activeSection.appendChild(activeHeader);
        
        const activeColumns = document.createElement('div');
        activeColumns.className = 'wikt-reformat-voice-columns';
        
        const activeCol1 = document.createElement('div');
        activeCol1.className = 'wikt-reformat-column';
        activeCol1.appendChild(createTenseTable('PRESENT', moodData.active.present));
        activeCol1.appendChild(createTenseTable('IMPERFECT', moodData.active.imperfect));
        activeCol1.appendChild(createTenseTable('FUTURE', moodData.active.future));
        
        const activeCol2 = document.createElement('div');
        activeCol2.className = 'wikt-reformat-column';
        activeCol2.appendChild(createTenseTable('PERFECT', moodData.active.perfect));
        activeCol2.appendChild(createTenseTable('PLUPERFECT', moodData.active.pluperfect));
        activeCol2.appendChild(createTenseTable('FUTURE PERFECT', moodData.active.futureperfect));
        
        activeColumns.appendChild(activeCol1);
        activeColumns.appendChild(activeCol2);
        activeSection.appendChild(activeColumns);
        container.appendChild(activeSection);

        // Passive Voice Section
        const passiveSection = document.createElement('div');
        passiveSection.className = 'wikt-reformat-voice-section';
        
        const passiveHeader = document.createElement('div');
        passiveHeader.className = 'wikt-reformat-voice-header';
        passiveHeader.textContent = 'PASSIVE';
        passiveSection.appendChild(passiveHeader);
        
        const passiveColumns = document.createElement('div');
        passiveColumns.className = 'wikt-reformat-voice-columns';
        
        const passiveCol1 = document.createElement('div');
        passiveCol1.className = 'wikt-reformat-column';
        passiveCol1.appendChild(createTenseTable('PRESENT', moodData.passive.present));
        passiveCol1.appendChild(createTenseTable('IMPERFECT', moodData.passive.imperfect));
        passiveCol1.appendChild(createTenseTable('FUTURE', moodData.passive.future));
        
        const passiveCol2 = document.createElement('div');
        passiveCol2.className = 'wikt-reformat-column';
        passiveCol2.appendChild(createTenseTable('PERFECT', moodData.passive.perfect));
        passiveCol2.appendChild(createTenseTable('PLUPERFECT', moodData.passive.pluperfect));
        passiveCol2.appendChild(createTenseTable('FUTURE PERFECT', moodData.passive.futureperfect));
        
        passiveColumns.appendChild(passiveCol1);
        passiveColumns.appendChild(passiveCol2);
        passiveSection.appendChild(passiveColumns);
        container.appendChild(passiveSection);

        section.appendChild(container);
        return section;
    }

    function createTenseTable(title, tenseData) {
        const container = document.createElement('div');
        if (!tenseData || Object.keys(tenseData).length === 0) return container;

        const tenseTitle = document.createElement('div');
        tenseTitle.className = 'wikt-reformat-tense-title';
        tenseTitle.textContent = title;
        container.appendChild(tenseTitle);

        const table = document.createElement('table');
        table.className = 'wikt-reformat-table';
        const tbody = document.createElement('tbody');
        const persons = {
            '1s': 'I sing.', '2s': 'II sing.', '3s': 'III sing.',
            '1p': 'I plur.', '2p': 'II plur.', '3p': 'III plur.'
        };
        for (const personKey in persons) {
            if (tenseData[personKey]) {
                const row = tbody.insertRow();
                row.insertCell().outerHTML = `<td class="wikt-reformat-person-col">${persons[personKey]}</td>`;
                row.insertCell().outerHTML = `<td class="wikt-reformat-form-col">${tenseData[personKey]}</td>`;
            }
        }
        if (tbody.hasChildNodes()) {
            table.appendChild(tbody);
            container.appendChild(table);
        }
        return container;
    }

    function createImperativeGroup(imperativeData) {
        const group = document.createElement('div');
        group.className = 'wikt-reformat-nonfinite-group';
        const presentTable = createTenseTable('IMPERATIVE PRESENT', imperativeData.active.present);
        if (presentTable.hasChildNodes()) group.appendChild(presentTable);
        const futureTable = createTenseTable('IMPERATIVE FUTURE', imperativeData.active.future);
        if (futureTable.hasChildNodes()) group.appendChild(futureTable);
        return group;
    }

    function createNonFiniteGroup(title, data, labels) {
        const group = document.createElement('div');
        group.className = 'wikt-reformat-nonfinite-group';
        const table = document.createElement('table');
        table.className = 'wikt-reformat-table';
        const tbody = document.createElement('tbody');

        for (const key in labels) {
            if (data[key] && data[key].trim() !== '—' && data[key].trim() !== '') {
                const row = tbody.insertRow();
                row.insertCell().outerHTML = `<td class="wikt-reformat-person-col">${labels[key]}</td>`;
                row.insertCell().outerHTML = `<td class="wikt-reformat-form-col">${data[key]}</td>`;
            }
        }

        if (tbody.hasChildNodes()) {
            const tenseTitle = document.createElement('div');
            tenseTitle.className = 'wikt-reformat-tense-title';
            tenseTitle.textContent = title;
            group.appendChild(tenseTitle);
            table.appendChild(tbody);
            group.appendChild(table);
        }
        return group;
    }

    /**
     * Sets up toggle functionality between original and reformatted views.
     * Creates a persistent header with toggle button that remains visible regardless of active view.
     * @param {HTMLElement} originalView - The original Wiktionary conjugation table
     * @param {HTMLElement} newView - The reformatted conjugation view
     */
    function setupToggle(originalView, newView) {
        // Create a separate container for the toggle header that stays visible
        const toggleContainer = document.createElement('div');
        toggleContainer.className = 'wikt-reformat-container';
        
        const headerDiv = document.createElement('div');
        headerDiv.className = 'wikt-reformat-header wikt-reformat-header-standalone';
        const titleSpan = document.createElement('span');
        titleSpan.className = 'wikt-reformat-title';
        titleSpan.textContent = 'Latin Conjugation';
        const toggleButton = document.createElement('button');
        toggleButton.className = 'wikt-reformat-toggle-btn';
        headerDiv.append(titleSpan, toggleButton);
        toggleContainer.appendChild(headerDiv);
        
        // Insert the toggle container before the new view
        newView.parentNode.insertBefore(toggleContainer, newView);
        
        // Remove the header styling from the new view since it's now separate
        const existingHeader = newView.querySelector('.wikt-reformat-header');
        if (existingHeader) {
            existingHeader.remove();
        }

        let isNewViewVisible = GM_getValue('isNewViewVisible', IS_NEW_VIEW_DEFAULT);
        console.log(getPrefix(), `Initial view state loaded: ${isNewViewVisible ? 'Improved' : 'Original'}`);

        function updateVisibility() {
            newView.style.display = isNewViewVisible ? 'block' : 'none';
            originalView.style.display = isNewViewVisible ? 'none' : 'block';
            toggleButton.textContent = isNewViewVisible ? 'Show Original Table' : 'Show Improved Table';
            console.log(getPrefix(), `Toggled view. Now showing: ${isNewViewVisible ? 'Improved' : 'Original'}`);
        }

        toggleButton.addEventListener('click', () => {
            isNewViewVisible = !isNewViewVisible;
            GM_setValue('isNewViewVisible', isNewViewVisible);
            updateVisibility();
        });

        updateVisibility();
        console.log(getPrefix(), "Toggle button setup complete.");
    }

    // --- SCRIPT EXECUTION ---
    console.log(getPrefix(), "Checking for Latin content...");
    if (document.getElementById('Latin')) {
        console.log(getPrefix(), "Latin section found. Setting up MutationObserver.");
        const targetNode = document.getElementById('mw-content-text');
        if (targetNode) {
            const observer = new MutationObserver(() => {
                if (document.querySelector('.roa-inflection-table') && !document.querySelector('.wikt-reformat-container')) {
                    console.log(getPrefix(), "MutationObserver detected a conjugation table.");
                    runReformatter();
                }
            });
            observer.observe(targetNode, { childList: true, subtree: true });
            window.addEventListener('load', () => {
                 console.log(getPrefix(), "Window 'load' event fired. Running reformatter as a fallback.");
                 if (!document.querySelector('.wikt-reformat-container')) runReformatter();
            });
        } else {
            console.error(getPrefix(), "Could not find target node '#mw-content-text' for MutationObserver.");
        }
    } else {
        console.log(getPrefix(), "No Latin section found on this page. Script will remain idle.");
    }

})();
