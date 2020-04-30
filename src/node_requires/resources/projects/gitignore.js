const defaultGitignore = `# Mac

.DS_Store

# Logs
logs
*.log
npm-debug.log*

# Runtime data
pids
*.pid
*.seed

# Dependency directory
# https://docs.npmjs.com/misc/faq#should-i-check-my-node-modules-folder-into-git
node_modules

# Windows

desktop\\.ini
`;

module.exports = {
    get() {
        return defaultGitignore;
    },
};
