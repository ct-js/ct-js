#!/usr/bin/env bun

import {execSync} from 'child_process';
import fs from 'fs';

// Function to get the latest tag
function getLatestTag(): string {
    try {
        return execSync('git describe --tags --abbrev=0').toString()
            .trim();
    } catch (error) {
        console.error('Error getting latest tag:', (error as Error).message);
        process.exit(1);
    }
}

// Function to get commits between latest tag and HEAD
function getCommitsBetweenTagAndHead(latestTag: string): string {
    try {
        return execSync(`git log ${latestTag}..HEAD --pretty=format:"%s"`).toString()
        .trim();
    } catch (error) {
        console.error('Error getting commits:', (error as Error).message);
        process.exit(1);
    }
}

// Function to clean commit message
function cleanCommitMessage(commitMessage: string): string {
    // Remove the emoji prefix
    return commitMessage.replace(/^(:([a-z_]+):|[✨🐞🐛⚡🌐])\s*/, '').trim();
}

// Type for grouped commits
interface GroupedCommits {
    [emoji: string]: string[];
}
const knownEmojis = {
    ':sparkles:': '✨ New features',
    '✨': '✨ New features',
    ':zap:': '⚡ Improvements',
    '⚡': '⚡ Improvements',
    ':bug:': '🐞 Bug fixes',
    ':globe_with_meridians:': '🌐 Translations',
    '🌐': '🌐 Translations',
    '🐞': '🐞 Bug fixes',
    '🐛': '🐞 Bug fixes',
    default: '💭 Other'
};

// Function to parse emoji from commit message
function getGroup(commitMessage: string): string {
    for (const emoji in knownEmojis) {
        if (commitMessage.startsWith(emoji)) {
            return knownEmojis[emoji];
        }
    }
    return knownEmojis.default;
}

// Main function
function generateChangelog(): void {
    // Get the latest tag
    const latestTag = getLatestTag();
    console.log(`Generating changelog from ${latestTag} to HEAD...`);

    // Get commits between tag and HEAD
    const commitsStr = getCommitsBetweenTagAndHead(latestTag);

    // If no commits, exit
    if (!commitsStr) {
        console.log('No commits found between the latest tag and HEAD.');
        process.exit(0);
    }

    // Split into array of commit messages
    const commits = commitsStr.split('\n');

    // Group commits by emoji and filter out "Internal:" and "Ignore:"
    const groupedCommits: GroupedCommits = {};

    commits.forEach(commit => {
        // Skip commits containing "Internal:" or "Ignore:"
        if (commit.includes('Internal:') || commit.includes('Ignore:') || commit.includes(':construction:')) {
            return;
        }

        const group = getGroup(commit);
        const cleanMessage = cleanCommitMessage(commit);

        if (!groupedCommits[group]) {
            groupedCommits[group] = [];
        }

        groupedCommits[group].push(cleanMessage);
    });

    // Generate the changelog
    let changelog = '';

    for (const group in groupedCommits) {
        if (groupedCommits[group].length > 0) {
            changelog += `### ${group}\n\n`;
            groupedCommits[group]
            .sort((a, b) => a.localeCompare(b))
            .forEach(message => {
                changelog += `- ${message}\n`;
            });
            changelog += '\n';
        }
    }

    // Output the changelog
    console.log('\n' + changelog);

    // Optionally write to a file
    fs.writeFileSync('CHANGELOG.md', changelog);
    console.log('Changelog written to CHANGELOG.md');
}

// Run the script
generateChangelog();
