import { exec } from 'child_process'
import { simpleGit } from 'simple-git'
import path from 'path'
import fs from 'fs'
import dotenv from 'dotenv'
import { promisify } from 'node:util'

// Load environment variables from .env files
dotenv.config()

const execAsync = promisify(exec)

/**
 * Execuytes a command asynchronously and handles its output and errors
 * @param {string} command - The command to execute
 * @param {object} [options={}] - Optional options to pass to exec
 */
async function runCommand(command, options = {}) {
	try {
		const { stdout, stderr } = await execAsync(command, options)
		process.stdout.write(stdout)
		process.stderr.write(stderr)
	} catch (error) {
		throw new Error(`Failed to execute command '${command}': ${error.message}`)
	}
}

/**
 * Main deployment function
 */
async function deploy() {
	const buildDir = path.join(process.env.BASEDIR, '/dist')
	const originalDir = process.cwd()
	const repoUrl = process.env.GITHUB_REPO

	if (!repoUrl) {
		console.error('Error: GITHUB_REPO environment variable is not set!')
		process.exit(1)
	}

	try {
		console.log('Starting deploy process...')

		// Check if build directory exists and delete if it does
		if (fs.existsSync(buildDir)) {
			console.log('Deleting existing build directory...')
			await fs.promises.rm(buildDir, { recursive: true, force: true })
		}

		// Build the project
		console.log('Running build...')
		await runCommand('bun run build')

		// Navigate into the build output directory
		console.log('Navigating to build directory...')
		process.chdir(buildDir)

		// Make a copy of index.html to 404.html
		console.log('Copying index.html to 404.html...')
		fs.copyFileSync('index.html', '404.html')

		// Check if we should create a CNAME or not
		if (process.env.TARGET_URL) {
			console.log('Creating CNAME file...')
			await fs.promises.writeFile(path.join(buildDir, 'CNAME'), process.env.TARGET_URL)
			console.log('CNAME file created successfully')
		}

		// Initialise a new Git repository
		const git = simpleGit(buildDir)
		console.log('Initialising git repository...')
		await git.init()

		// Check if remote 'origin' already exists
		const remotes = await git.getRemotes(true)
		const originRemote = remotes.find((remote) => remote.name === 'origin')

		// Add 'origin' remote if it doesn't exist
		if (!originRemote) {
			console.log("Adding 'origin' remote...")
			await git.addRemote('origin', repoUrl)
		} else {
			console.log("'origin' remote already exists.")
		}

		// Add all files to the repository
		console.log('Adding files to git...')
		await git.add('.')

		// Commit the changes
		console.log('Commiting changes...')
		await git.commit('Deployed via script')

		// Force push to the gh-pages branch
		console.log('Pushing to Github...')
		await git.push('origin', 'HEAD:gh-pages', { '--force': null })

		console.log('Deploy process completed successfully.')

		// Change back to original directory
		process.chdir(originalDir)

		// Remove the build output directory
		console.log('Removing build directory...')
		await fs.promises.rm(buildDir, { recursive: true, force: true })

		console.log('Build directory removed successfully')
	} catch (error) {
		console.error(`Deploy process failed: ${error.message}`)
		process.exit(1)
	}
}

deploy()
