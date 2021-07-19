# Advanced Simulator for Cumulocity

------------------------------

These tools are provided as-is and without warranty or support. They do not constitute part of the Software AG product suite. Users are free to use, fork and modify them, subject to the license agreement. While Software AG welcomes contributions, we cannot guarantee to include every contribution in the master project.

## Feature Log
- Create thousands of instructions simple with an UI
- Orchestrate thousands of instructions effortlessly
- Linear scale, Waveform, randomization are some of the 1-click features
- Check the outcome of your simulator before even starting it with charts and Aggregations of all kind
- Do bulk updates to all measurements
- Simulate CSV data of real device
- Templates to create multiple simulators

## Install Guide
Through the UI:
1. Go to the <a href="https://github.com/SoftwareAG/cumulocity-advanced-simulator/releases/">releases</a> section in GitHub and download the latest ZIP
2. Open the administration app in your tenant
3. Click on "Applications" -> "Own applications" -> and in top right corner "Add application" 
4. "Upload Web application" -> Select the Zip

Alternative way to install through CLI:
1. Fork and clone the repositoriy
2. Use ```npm install && npm build``` in the cloned Repo
3. Run ```npm deploy``` and enter the URL of your tenant and enter credentials with the appropriate permission