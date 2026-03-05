const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function (file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            if (!file.includes('node_modules') && !file.includes('.expo')) {
                results = results.concat(walk(file));
            }
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('.');

const replacers = [
    // Components
    { from: /from ['"]@\/?components\/calendar\/(.*?)['"]/g, to: 'from "@/features/calendar/components/$1"' },
    { from: /from ['"]@\/?components\/services\/(.*?)['"]/g, to: 'from "@/features/services/components/$1"' },
    { from: /from ['"]@\/?components\/common\/(.*?)['"]/g, to: 'from "@/ui/components/common/$1"' },
    { from: /from ['"]@\/?components\/(?!ui|common|features)(.*?)['"]/g, to: 'from "@/ui/components/$1"' },

    // Core and Services
    { from: /from ['"]@\/?hooks\/(.*?)['"]/g, to: 'from "@/core/hooks/$1"' },
    { from: /from ['"]@\/?constants\/(.*?)['"]/g, to: 'from "@/constants/$1"' },
    { from: /from ['"]@\/?styles\/(.*?)['"]/g, to: 'from "@/constants/$1"' },
    { from: /from ['"]@\/?lib\/api['"]/g, to: 'from "@/core/api/api"' },

    { from: /from ['"]@\/?services\/auth\.service['"]/g, to: 'from "@/features/auth/services/auth.service"' },
    { from: /from ['"]@\/?services\/empresa\.service['"]/g, to: 'from "@/features/empresa/services/empresa.service"' },
    { from: /from ['"]@\/?services\/services\.service['"]/g, to: 'from "@/features/services/services/services.service"' },
    { from: /from ['"]@\/?types\/(.*?)['"]/g, to: 'from "@/types/$1"' },

    // Relative replacements inside src/features/xxx
    { from: /from ['"](?:\.\.\/)+components\/(.*?)['"]/g, to: 'from "@/ui/components/$1"' },
    { from: /from ['"](?:\.\.\/)+hooks\/(.*?)['"]/g, to: 'from "@/core/hooks/$1"' },
    { from: /from ['"](?:\.\.\/)+constants\/(.*?)['"]/g, to: 'from "@/constants/$1"' },
    { from: /from ['"](?:\.\.\/)+styles\/(.*?)['"]/g, to: 'from "@/constants/$1"' },
    { from: /from ['"](?:\.\.\/)+lib\/api['"]/g, to: 'from "@/core/api/api"' }
];

let changedCount = 0;
for (const file of files) {
    if (file.includes('fix-imports.js')) continue;
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    for (const r of replacers) {
        content = content.replace(r.from, (match, p1) => {
            // Replace group $1 manually
            let res = r.to;
            if (p1) res = res.replace('$1', p1);
            return res;
        });
    }

    if (content !== original) {
        fs.writeFileSync(file, content);
        changedCount++;
        console.log('Updated imports in', file);
    }
}
console.log('Total files updated:', changedCount);
