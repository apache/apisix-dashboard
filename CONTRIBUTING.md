<!--
#
# Licensed to the Apache Software Foundation (ASF) under one or more
# contributor license agreements.  See the NOTICE file distributed with
# this work for additional information regarding copyright ownership.
# The ASF licenses this file to You under the Apache License, Version 2.0
# (the "License"); you may not use this file except in compliance with
# the License.  You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
-->

# Contributing to Apache APISIX Dashboard

We would love for you to contribute to Apache APISIX Dashboard and help make it even better than it is today! As a contributor, here are the guidelines we would like you to follow:

- [Code of Conduct](#coc)
- [How to contribute?](#contribute)
- [How to report a bug?](#bug)
- [How to add a new feature?](#feature)
- [Commit Message Guidelines](#commit)
- [Question or Problem?](#question)

## <a name="coc"></a> Code of Conduct

This project and everyone participating in it is governed by the Apache software Foundation's [Code of Conduct](http://www.apache.org/foundation/policies/conduct.html). By participating, you are expected to adhere to this code. If you are aware of unacceptable behavior, please visit the [Reporting Guidelines page](http://www.apache.org/foundation/policies/conduct.html#reporting-guidelines) and follow the instructions there.

## <a name="contribute"></a> How to contribute?

Most of the contributions that we receive are code contributions, but you can also contribute to the documentation or simply report solid bugs for us to fix.

## <a name="bug"></a> How to report a bug?

- **Ensure the bug was not already reported** by searching on GitHub under [Issues](https://github.com/apache/apisix-dashboard/issues).

- If you're unable to find an open issue addressing the problem, [open a new one](https://github.com/apache/apisix-dashboard/issues/new). Be sure to include a **title and clear description**, as much relevant information as possible, and a **code sample** or an **executable test case** demonstrating the expected behavior that is not occurring.

## <a name="feature"></a> How to add a new feature or change an existing one

_Before making any significant changes, please [open an issue](https://github.com/apache/apisix-dashboard/issues)._ Discussing your proposed changes ahead of time will make the contribution process smooth for everyone.

Once we've discussed your changes and you've got your code ready, make sure that tests are passing and open your pull request. Your PR is most likely to be accepted if it:

- Update the README.md with details of changes to the interface.
- Includes tests for new functionality.
- References the original issue in description, e.g. "resolve #123".
- Has a [good commit message](http://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html).

## <a name="commit"></a> Commit Message Format

*This specification is inspired by and supersedes the [AngularJS commit message format][commit-message-format].*

We have very precise rules over how our Git commit messages must be formatted.
This format leads to **easier to read commit history**.

Each commit message consists of a **header**, a **body**, and a **footer**.


```
<header>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

The `header` is mandatory and must conform to the [Commit Message Header](#commit-header) format.

The `body` is mandatory for all commits except for those of type "docs".
When the body is present it must be at least 20 characters long and must conform to the [Commit Message Body](#commit-body) format.

The `footer` is optional. The [Commit Message Footer](#commit-footer) format describes what the footer is used for and the structure it must have.

Any line of the commit message cannot be longer than 100 characters.

#### <a name="commit-header"></a> Commit Message Header

```
<type>(<scope>): <short summary>
  │       │             │
  │       │             └─⫸ Summary in present tense. Not capitalized. No period at the end.
  │       │
  │       └─⫸ Commit Scope: route|upstream|consumer|ssl|plugin|common
  │
  └─⫸ Commit Type: build|ci|docs|feat|fix|perf|refactor|test
```

The `<type>` and `<summary>` fields are mandatory, the `(<scope>)` field is optional.


##### Type

Must be one of the following:

* **build**: Changes that affect the build system or external dependencies (example scopes: webpack, npm)
* **ci**: Changes to our CI configuration files and scripts (example scopes: GitHub Actions)
* **docs**: Documentation only changes
* **feat**: A new feature
* **fix**: A bug fix
* **perf**: A code change that improves performance
* **refactor**: A code change that neither fixes a bug nor adds a feature
* **test**: Adding missing tests or correcting existing tests

##### Scope
The scope should be the name of the npm package affected (as perceived by the person reading the changelog generated from commit messages).

The following is the list of supported scopes:

* `route`
* `upstream`
* `consumer`
* `ssl`
* `plugin`
* `common`

There are currently a few exceptions to the "use package name" rule:

* `packaging`: used for changes that change the npm package layout in all of our packages, e.g. public path changes, package.json changes done to all packages, d.ts file/format changes, changes to bundles, etc.

* `changelog`: used for updating the release notes in CHANGELOG.md

* none/empty string: useful for `test` and `refactor` changes that are done across all packages (e.g. `test: add missing unit tests`) and for docs changes that are not related to a specific package (e.g. `docs: fix typo in tutorial`).


##### Summary

Use the summary field to provide a succinct description of the change:

* use the imperative, present tense: "change" not "changed" nor "changes"
* don't capitalize the first letter
* no dot (.) at the end


#### <a name="commit-body"></a> Commit Message Body

Just as in the summary, use the imperative, present tense: "fix" not "fixed" nor "fixes".

Explain the motivation for the change in the commit message body. This commit message should explain _why_ you are making the change.
You can include a comparison of the previous behavior with the new behavior in order to illustrate the impact of the change.


#### <a name="commit-footer"></a> Commit Message Footer

The footer can contain information about breaking changes and is also the place to reference GitHub issues, Jira tickets, and other PRs that this commit closes or is related to.

```
BREAKING CHANGE: <breaking change summary>
<BLANK LINE>
<breaking change description + migration instructions>
<BLANK LINE>
<BLANK LINE>
Fixes #<issue number>
```

Breaking Change section should start with the phrase "BREAKING CHANGE: " followed by a summary of the breaking change, a blank line, and a detailed description of the breaking change that also includes migration instructions.

### Revert commits

If the commit reverts a previous commit, it should begin with `revert: `, followed by the header of the reverted commit.

The content of the commit message body should contain:

- information about the SHA of the commit being reverted in the following format: `This reverts commit <SHA>`,
- a clear description of the reason for reverting the commit message.

## <a name="question"></a> Do you have questions about the source code?

- Subscribe to our mail list and send the question mail to [dev@apisix.apache.org](mailto:dev@apisix.apache.org)
