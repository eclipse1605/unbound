#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const EXTENSIONS_TO_CLEAN = [
  '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs',
  '.css', '.scss', '.less', '.json'
];

const EXCLUDE_DIRS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  'out',
  'coverage'
];

const COMMENT_PATTERNS = [
  
  /\/\/\s*(.+?)$/gm,
  
  /\/\*[\s\S]*?\*\
];

const PRESERVE_PATTERNS = [
  
  /\/\*\*\s*\n\s*\*\s*@[a-zA-Z]+[\s\S]*?\*\
];

function shouldProcessFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  
  if (ext === '.sol') return false;

  return EXTENSIONS_TO_CLEAN.includes(ext);
}

function shouldProcessDir(dirPath) {
  const basename = path.basename(dirPath);
  return !EXCLUDE_DIRS.includes(basename);
}

function removeComments(content) {
  
  const preservePositions = [];
  
  PRESERVE_PATTERNS.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      preservePositions.push({
        start: match.index,
        end: match.index + match[0].length
      });
    }
  });

  COMMENT_PATTERNS.forEach(pattern => {
    content = content.replace(pattern, (match, ...args) => {
      const matchIndex = args[args.length - 2];

      for (const range of preservePositions) {
        if (matchIndex >= range.start && matchIndex < range.end) {
          return match; 
        }
      }

      if (pattern.toString().includes('
        const line = content.substring(
          content.lastIndexOf('\n', matchIndex) + 1,
          content.indexOf('\n', matchIndex)
        );

        const commentStart = line.indexOf('
        if (commentStart > 0 && line.substring(0, commentStart).trim() !== '') {
          return match;
        }
      }
      
      return ''; 
    });
  });

  content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  return content;
}

async function processFile(filePath) {
  try {
    if (!shouldProcessFile(filePath)) return;
    
    const content = await readFile(filePath, 'utf8');
    const cleaned = removeComments(content);
    
    if (content !== cleaned) {
      await writeFile(filePath, cleaned, 'utf8');
      console.log(`Cleaned: ${filePath}`);
    }
  } catch (err) {
    console.error(`Error processing ${filePath}:`, err);
  }
}

async function processDirectory(dirPath) {
  try {
    const entries = await readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const entryPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        if (shouldProcessDir(entryPath)) {
          await processDirectory(entryPath);
        }
      } else if (entry.isFile()) {
        await processFile(entryPath);
      }
    }
  } catch (err) {
    console.error(`Error processing directory ${dirPath}:`, err);
  }
}

async function main() {
  const rootDir = process.argv[2] || '.';
  console.log(`Starting to clean comments in ${rootDir}...`);
  
  const startTime = Date.now();
  await processDirectory(rootDir);
  const duration = (Date.now() - startTime) / 1000;
  
  console.log(`Completed in ${duration.toFixed(2)} seconds.`);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
}); 