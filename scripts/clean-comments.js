#!/usr/bin/env node

/**
 * Script to remove unnecessary comments from JavaScript/TypeScript files
 * Preserves comments in Solidity files and JSDoc documentation
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// File extensions to process
const EXTENSIONS_TO_CLEAN = [
  '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs',
  '.css', '.scss', '.less', '.json'
];

// Directories to exclude
const EXCLUDE_DIRS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  'out',
  'coverage'
];

// Patterns to identify critical code that shouldn't be touched
const PROTECTED_PATTERNS = [
  // URLs with various protocols
  /https?:\/\/\S+/g,
  /ftp:\/\/\S+/g,
  /file:\/\/\S+/g,
  /ws:\/\/\S+/g,
  
  // SVG and XML tags/attributes
  /<svg[\s\S]*?<\/svg>/g,
  /<path[\s\S]*?\/>/g,
  /xmlns=["'][^"']*["']/g,
  /viewBox=["'][^"']*["']/g,
  
  // Import statements
  /import\s+.*?from\s+['"].*?['"]/g,
  /require\(['"].*?['"]\)/g,
  
  // JSDoc comments
  /\/\*\*\s*\n(?:\s*\*[^\n]*\n)*\s*\*\//g,
  
  // Regular expressions
  /\/[^\/\n]+\/[gimuy]*/g,
  
  // Any line containing a colon followed by double slash (like http://)
  /\w+:\/{2}[^\s"')]*?/g
];

/**
 * Check if a file should be processed
 */
function shouldProcessFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  
  // Skip Solidity files
  if (ext === '.sol') return false;
  
  // Only process files with extensions in our list
  return EXTENSIONS_TO_CLEAN.includes(ext);
}

/**
 * Check if a directory should be processed
 */
function shouldProcessDir(dirPath) {
  const basename = path.basename(dirPath);
  return !EXCLUDE_DIRS.includes(basename);
}

/**
 * Find all protected regions in the content
 */
function findProtectedRegions(content) {
  const protectedRegions = [];
  
  // Find all matches for each protected pattern
  PROTECTED_PATTERNS.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      protectedRegions.push({
        start: match.index,
        end: match.index + match[0].length,
        text: match[0]
      });
    }
  });
  
  return protectedRegions;
}

/**
 * Check if a position is within any protected region
 */
function isInProtectedRegion(position, protectedRegions) {
  for (const region of protectedRegions) {
    if (position >= region.start && position < region.end) {
      return true;
    }
  }
  return false;
}

/**
 * Safely remove comments from a file's content
 */
function removeComments(content) {
  // First find protected regions that we shouldn't touch
  const protectedRegions = findProtectedRegions(content);
  
  // Replace single-line comments, being careful about URLs
  content = content.replace(/\/\/(.*?)(?:\r?\n|$)/g, (match, commentContent, offset) => {
    // Skip if this comment is in a protected region
    if (isInProtectedRegion(offset, protectedRegions)) {
      return match;
    }
    
    // Check if this is part of a URL (e.g. http://)
    const lineStart = content.lastIndexOf('\n', offset) + 1;
    const beforeComment = content.substring(lineStart, offset).trim();
    
    // Skip if the comment isn't at the start of a line or has special patterns
    if (beforeComment !== '' || commentContent.includes('http://') || commentContent.includes('https://')) {
      return match;
    }
    
    // Replace the comment with a newline to maintain line numbers
    return match.endsWith('\n') ? '\n' : '';
  });
  
  // Replace multi-line comments, preserving JSDoc
  content = content.replace(/\/\*[\s\S]*?\*\//g, (match, offset) => {
    // Skip if this is a JSDoc comment or in a protected region
    if (match.startsWith('/**') || isInProtectedRegion(offset, protectedRegions)) {
      return match;
    }
    return '';
  });
  
  // Clean up empty lines and multiple empty lines
  content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  return content;
}

/**
 * Process a file
 */
async function processFile(filePath) {
  try {
    if (!shouldProcessFile(filePath)) return false;
    
    const content = await readFile(filePath, 'utf8');
    const cleaned = removeComments(content);
    
    if (content !== cleaned) {
      await writeFile(filePath, cleaned, 'utf8');
      console.log(`Cleaned: ${filePath}`);
      return true;
    }
    return false;
  } catch (err) {
    console.error(`Error processing ${filePath}:`, err);
    return false;
  }
}

/**
 * Process all files in a directory recursively
 */
async function processDirectory(dirPath) {
  try {
    const entries = await readdir(dirPath, { withFileTypes: true });
    let processedCount = 0;
    
    for (const entry of entries) {
      const entryPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        if (shouldProcessDir(entryPath)) {
          processedCount += await processDirectory(entryPath);
        }
      } else if (entry.isFile()) {
        const wasProcessed = await processFile(entryPath);
        if (wasProcessed) processedCount++;
      }
    }
    
    return processedCount;
  } catch (err) {
    console.error(`Error processing directory ${dirPath}:`, err);
    return 0;
  }
}

/**
 * Main function
 */
async function main() {
  const rootDir = process.argv[2] || '.';
  console.log(`Starting to clean comments in ${rootDir}...`);
  
  const startTime = Date.now();
  const processedCount = await processDirectory(rootDir);
  const duration = (Date.now() - startTime) / 1000;
  
  console.log(`Completed in ${duration.toFixed(2)} seconds.`);
  console.log(`Processed ${processedCount} files.`);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
}); 