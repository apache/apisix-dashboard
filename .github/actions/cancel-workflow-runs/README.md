<p><a href="https://github.com/potiuk/cancel-workflow-runs/actions">
<img alt="cancel-workflow-runs status"
    src="https://github.com/potiuk/cancel-workflow-runs/workflows/Test%20the%20build/badge.svg"></a>

# Cancel Workflow Runs action


<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Context and motivation](#context-and-motivation)
- [Usage](#usage)
- [The Action "target" workflow](#the-action-target-workflow)
- [Inputs and outputs](#inputs-and-outputs)
  - [Inputs](#inputs)
  - [Outputs](#outputs)
  - [Most often used canceling example](#most-often-used-canceling-example)
- [More Examples](#more-examples)
  - [Repositories that use Pull Requests from forks](#repositories-that-use-pull-requests-from-forks)
    - [Cancel duplicate runs for the source workflow](#cancel-duplicate-runs-for-the-source-workflow)
    - [Cancel duplicate jobs for triggered workflow](#cancel-duplicate-jobs-for-triggered-workflow)
    - [Cancel the "self" source workflow run](#cancel-the-self-source-workflow-run)
    - [Cancel the "self" triggered workflow run](#cancel-the-self-triggered-workflow-run)
    - [Fail-fast source workflow runs with failed jobs](#fail-fast-source-workflow-runs-with-failed-jobs)
    - [Fail-fast source workflow runs with failed jobs and corresponding triggered runs](#fail-fast-source-workflow-runs-with-failed-jobs-and-corresponding-triggered-runs)
    - [Fail-fast for triggered workflow runs with failed jobs](#fail-fast-for-triggered-workflow-runs-with-failed-jobs)
    - [Cancel another workflow run](#cancel-another-workflow-run)
    - [Cancel all duplicates for named jobs](#cancel-all-duplicates-for-named-jobs)
  - [Repositories that do not use Pull Requests from forks](#repositories-that-do-not-use-pull-requests-from-forks)
    - [Cancel duplicate runs for "self" workflow](#cancel-duplicate-runs-for-self-workflow)
    - [Cancel "self" workflow run](#cancel-self-workflow-run)
    - [Fail-fast workflow runs with failed jobs](#fail-fast-workflow-runs-with-failed-jobs)
    - [Cancel all runs with named jobs](#cancel-all-runs-with-named-jobs)
  - [Tackling the high queue strain situation](#tackling-the-high-queue-strain-situation)
  - [Development environment](#development-environment)
  - [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Context and motivation

Cancel Workflow Runs is an action that utilizes `workflow_run` triggers in order to perform various
run cancel operations. The idea is to save number of jobs and free them for other queued runs. It is
particularly useful in case your projects development flow where contributors submit pull requests
from forks. Using `workflow_run` trigger enables safe canceling of runs triggered by such pull requests.

In case your CI takes a lot of time and uses a lot of jobs, the action might help your project
to reduce job usage and decrease waiting time as it detects and cancels runs that are still executed,
but we know already they are superseded by newer runs.

The main purpose of this action is canceling duplicated runs for the same branch as the current run,
effectively limiting the resource consumption of the workflow to one run per branch. In short, the action
is useful if you want to limit jobs usage on GitHub Actions in case of the usage pattern
when fixups/rebases are pushed in quick succession to the same branch (fast iterations on a Pull Request).
This is achieved by `duplicates` cancel mode. The `duplicates` mode only cancels "past" runs - it does
not take into account runs that were started after the "current" run.

Another use case is to cancel the `pull_request` corresponding to the `workflow_run` triggered run.
This can happen when the triggered `workflow_run` finds that it makes no sense to proceed with
the source run. This is achieved by `self` cancel mode.

There are also two supplementary cancel modes for the action. Those supplementary use cases allow for further
optimisations - failing fast in case we detect that important job failed and canceling duplicates of the
`workflow_run` triggered events in case they execute some heavy jobs. This is achieved by `failedJobs` and
`namedJobs` cancel modes.

Note that `namedjobs` cancel mode is solely for the purpose of bypassing current limitations
of GitHub Actions. Currently, there is no way to retrieve connection between triggering and triggered
workflow in case of `workflow_run`, as well as retrieving repository and branch of the triggering
workflow. The action uses workaround - it requires designing workflows in the way that they pass necessary
information via carefully crafted job names. The job names are accessible via GitHub API, and they can be
resolved during execution of the workflow using information about the linked workflow available
at the workflow runtime. Hopefully this information will soon be available in GitHub Actions allowing
removal of `namedJobs` cancel mode and simplifying the examples and workflows using the Action.

Another feature of the Action is to notify the PRs linked to the workflows. Normally when workflows
get cancelled there is no information why it happens, but this action can add an explanatory comment
to the PR if the PR gets cancelled. This is controlled by `notifyPRCancel` boolean input.

Also, for the `workflow_run` events, GitHub does not yet provide an easy interface linking the original
Pull Request and the Workflow_run. You can ask the CancelWorkflowRun action to add extra comment to the PR
adding explanatory message followed by a link to the `workflow_run` run.

You can take a look at the description provided in the
[Apache Airflow's CI](https://github.com/apache/airflow/blob/master/CI.rst) and
[the workflows](https://github.com/apache/airflow/blob/master/.github/workflows)

Started from simple cancel workflow developed by [n1hility](https://github.com/n1hility)
that implemented cancelling previous runs before introducing `workflow_run` type of event by
GitHub Actions: [Cancel](https://github.com/n1hility/cancel-previous-runs).

# Usage

If you want a comprehensive solution, you should use the action as follows:

1) In case your project does not use public forks, it's enough to have one action with the `duplicates`
   cancel mode in the workflow. This is a rare thing in open-source projects (usually those projects
   accept pull requests from forks) and more often applicable for private repositories.

2) If you use forks, you should create a separate "Cancelling" `workflow_run` triggered workflow.
   The `workflow_run` should be responsible for all canceling actions. The examples below show
   the possible ways the action can be utilized.

3) If you have "high queue strain" situation - i.e. you often have many workflows queued due to limits
   of teh GitHub Actions queue, you should consider using `allDuplicates` cancelling mode because otherwise,
   the cancel itself might get queued until it is already too late to cancel the job. The `allDuplicates`
   mode has been  designed to tackle this kind of situation where the "canceling" workflows are also queued,
   in which case the cancel actions are far more aggressive in cancelling the workflow runs - including
   the workflow runs that were started after the cancel action run. More about it in the
   [Tackling the high queue strain situation](#tackling-the-high-queue-strain-situation)

# The Action "target" workflow

The Action always acts on single "target" workflow. This means that it selects candidates to cancelling
(depending on the cabcelling mode) from all workflow runs that belong to a particular workflow.

This "workflow" to act on can be chosen in several ways:

1) By default, the action acts on workflow runs the action belongs to
2) When you want to enable canceling for Pull Requests from forks, the action should be run in a
   `workflow_run` type of event. In such case there are two workflows "the source" (for example pull_request) that
   was the original one and "the target workflow" triggered by the source one (this is the workflow that
   the cancel action should be part of). In such `workflow_run` type of event you should specify
   "${{ github.event.workflow_run.id }}" as `sourceRunId` - then the action will act on the "source"
   workflow instead of the default "target" one.
3) You can explicitly specify the `workflowFileName` parameter to make the action works on specified workflow.

Again - the action always acts on a single workflow, so if you want to specify a single job that should cancel
few different workflows, you need to copy that step as many times you need and set different
`workflowFileName` for every step. This is quite a bit repetitive, but this way you can see logs from
canceling operations from each workflow separately, and you can reason about it, at the same time having
multiple steps in the same jobs allows to optimize overhead of machine starting per job as those
actions are usually very quick.

```yaml
  cancel-multiple-workflow-runs:
    name: "Cancel the self CI workflow run"
    runs-on: ubuntu-latest
    steps:
      - name: "Cancel workflow 1"
        uses: potiuk/cancel-workflow-runs@master
        with:
          cancelMode: allDuplicates
          cancelFutureDuplicates: true
          token: ${{ secrets.GITHUB_TOKEN }}
          workflowFileName: workflow_1.yml
      - name: "Cancel workflow 2"
        uses: potiuk/cancel-workflow-runs@master
        with:
          cancelMode: allDuplicates
          cancelFutureDuplicates: true
          token: ${{ secrets.GITHUB_TOKEN }}
          workflowFileName: workflow_2.yml
```

# Inputs and outputs

## Inputs

| Input                    | Required | Default      | Comment                                                                                                                                                                                                          |
|--------------------------|----------|--------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `token`                  | yes      |              | The github token passed from `${{ secrets.GITHUB_TOKEN }}`                                                                                                                                                       |
| `cancelMode`             | no       | `duplicates` | The mode to run cancel on. The available options are `duplicates`, `allDuplicates`, `self`, `failedJobs`, `namedJobs`                                                                                            |
| `cancelFutureDuplicates` | no       | true         | In case of duplicate canceling, cancel also future duplicates leaving only the "freshest" running job and not all the future jobs. By default it is set to true.                                                 |
| `sourceRunId`            | no       |              | Useful only in `workflow_run` triggered events. It should be set to the id of the workflow triggering the run `${{ github.event.workflow_run.id }}`  in case cancel operation should cancel the source workflow. |
| `notifyPRCancel`         | no       |              | Boolean. If set to true, it notifies the cancelled PRs with a comment containing reason why they are being cancelled.                                                                                            |
| `notifyPRCancelMessage`  | no       |              | Optional cancel message to use instead of the default one when notifyPRCancel is true.  It is only used in 'self' cancelling mode.                                                                               |
| `notifyPRMessageStart`   | no       |              | Only for workflow_run events triggered by the PRs. If not empty, it notifies those PRs with the message specified at the start of the workflow - adding the link to the triggered workflow_run.                  |
| `jobNameRegexps`         | no       |              | An array of job name regexps. Only runs containing any job name matching any of of the regexp in this array are considered for cancelling in `failedJobs` and `namedJobs` and `allDuplicateNamedJobs` modes.     |
| `skipEventTypes`         | no       |              | Array of event names that should be skipped when cancelling (JSON-encoded string). This might be used in order to skip direct pushes or scheduled events.                                                        |
| `selfPreservation`       | no       | true         | Do not cancel self.                                                                                                                                                                                              |
| `workflowFileName`       | no       |              | Name of the workflow file. It can be used if you want to cancel a different workflow than yours.                                                                                                                 |


The job cancel modes work as follows:

| Cancel Mode              | No `sourceRunId` specified                                                   | The `sourceRunId` set to `${{ github.event.workflow_run.id }}`                      |
|--------------------------|------------------------------------------------------------------------------|-------------------------------------------------------------------------------------|
| `duplicates`             | Cancels duplicate runs from the same repo/branch as current run.             | Cancels duplicate runs for the same repo/branch as the source run.                  |
| `allDuplicates`          | Cancels duplicate runs from all running workflow runs of specified workflow. | Cancels duplicate runs from all running workflow runs of the source workflow.       |
| `self`                   | Cancels self run.                                                            | Cancel the `sourceRunId` run.                                                       |
| `failedJobs`             | Cancels all runs of own workflow that have matching jobs that failed.        | Cancels all runs of the `sourceRunId` workflow that have matching jobs that failed. |
| `namedJobs`              | Cancels all runs of own workflow that have matching jobs.                    | Cancels all runs of the `sourceRunId` workflow that have matching jobs.             |
| `allDuplicatedNamedJobs` | Cancels all duplicate runs of own workflow that share matching jobs pattern. | Cancels all runs of the `sourceRunId` workflow that share matching job pattern.     |


## Outputs

| Output              | No `sourceRunId` specified                              | The `sourceRunId` set to `${{ github.event.workflow_run.id }}`                                       |
|---------------------|---------------------------------------------------------|------------------------------------------------------------------------------------------------------|
| `sourceHeadRepo`    | Current repository. Format: `owner/repo`                | Repository of the run that triggered this `workflow_run`. Format: `owner/repo`                       |
| `sourceHeadBranch`  | Current branch.                                         | Branch of the run that triggered this `workflow_run`. Might be forked repo, if it is a pull_request. |
| `sourceHeadSha`     | Current commit SHA: `{{ github.sha }}`                  | Commit sha of the run that triggered this `workflow_run`.                                            |
| `mergeCommitSha`    | Merge commit SHA if PR-triggered event.                 | Merge commit SHA if PR-triggered event.                                                              |
| `targetCommitSha`   | Target commit SHA (merge if present, otherwise source). | Target commit SHA (merge if present, otherwise source).                                              |
| `pullRequestNumber` | Number of the associated Pull Request (if PR triggered) | Number of the associated Pull Request (if PR triggered)                                              |
| `sourceEvent`       | Current event: ``${{ github.event }}``                  | Event of the run that triggered this `workflow_run`                                                  |
| `cancelledRuns`     | JSON-stringified array of cancelled run ids.            | JSON-stringified array of cancelled run ids.                                                         |

## Most often used canceling example

The most common canceling example is that you want to cancel all duplicates appearing in your build queue.
As of 4.1 version of the Action this can be realised by single workflow run that can cancel all duplicates
for all running workflows. It is resistant to temporary queues - as it can cancel also the future, queued
workflows that have duplicated, fresher (also queued workflows and this is recommended for everyone.

The below example is a "workflow_run" type of event. The workflow_run event always has "write" access that allows
it to cancel other workflows - even if they are coming from pull request.

```yaml
name: Cancelling Duplicates
on:
  workflow_run:
    workflows: ['CI']
    types: ['requested']

jobs:
  cancel-duplicate-workflow-runs:
    name: "Cancel duplicate workflow runs"
    runs-on: ubuntu-latest
    steps:
      - uses: potiuk/cancel-workflow-runs@master
        name: "Cancel duplicate workflow runs"
        with:
          cancelMode: allDuplicates
          token: ${{ secrets.GITHUB_TOKEN }}
          sourceRunId: ${{ github.event.workflow_run.id }}
```


# More Examples

Note that you can combine the steps below in several steps of the same job. The examples here are showing
one step per case for clarity.

## Repositories that use Pull Requests from forks

Note that in case you implement separate "Canceling workflow", following the examples below, you do not
need to add cancel action to any other workflow. All Cancel actions should be configured in this
Cancelling workflow.

Those examples show how you should configure your project with separate `Cancelling` workflow which is
triggered via `workflow_run` trigger.

In the example belows we use the following names:

* **triggered workflow** - the "Cancelling" workflow - separate workflow triggered by the `workflow_run`
  event. Its main job is to manage cancelling of other workflows.

* **triggered run** - the run of the *triggered workflow*. It is triggered by another ("source") run. In the
  examples below, this run is in "Cancelling" workflow. It always runs in the context of the main repository,
  even if it is triggered by a Pull Request from a fork.

* **source workflow** - the "main" workflow - main workflow that performs CI actions. In the examples below,
  this is a "CI" workflow.

* **source run** - the run of the *source workflow*. It is the run that triggers the *triggered run*,
  and it runs most of the CI tasks. In the examples below those are the runs of "CI" workflow.

### Cancel duplicate runs for the source workflow

Cancel past, duplicate *source runs* of the *source workflow*. This workflow cancels
duplicated, past runs (for the same branch/repo that those associated with the *source run* that triggered
the *triggered run*). You have to create it with the `sourceRunId` input with the value of
`${{ github.event.workflow_run.id }}` in order to work correctly.

In the example below, the `Canceling` run cancels past, duplicate runs from the `CI` with the same
branch/repo as the *source run* which triggered it - effectively what's left after the action is only
the latest *source run* of "CI" from the same branch/repo.

This works for all kind of triggering events (`push`, `pull_request`, `schedule` ...). It works for
events triggered in the local repository, as well as triggered from the forks, so you do not need
to set up any extra actions to cancel internal Pushes/Pull Requests.

You can also choose to skip certain types of events (for example `push` and `schedule` if you want your
jobs to run to full completion for this kind of events.

```yaml
name: Cancelling
on:
  workflow_run:
    workflows: ['CI']
    types: ['requested']

jobs:
  cancel-duplicate-workflow-runs:
    name: "Cancel duplicate workflow runs"
    runs-on: ubuntu-latest
    steps:
      - uses: potiuk/cancel-workflow-runs@master
        name: "Cancel duplicate workflow runs"
        with:
          cancelMode: duplicates
          cancelFutureDuplicates: true
          token: ${{ secrets.GITHUB_TOKEN }}
          sourceRunId: ${{ github.event.workflow_run.id }}
          notifyPRCancel: true
          skipEventTypes: '["push", "schedule"]'
```

Note that `duplicate` cancel mode cannot be used for `workflow_run` type of event without `sourceId` input.
The action will throw an error in this case because it is not really doing what you would expect it to do.
All `workflow_run` events have the same branch and repository (they are all run in the context of the
target branch and repository) no matter what is the source of the event, therefore cancelling duplicates
would cancel all the runs originated from all the branches and this is not really expected.

If you want to cancel duplicate runs of the *triggered workflow*, you need to utilize the
`namedJob` cancel mode as described in the next chapter
[Cancel duplicate jobs for triggered workflow](#cancel-duplicate-jobs-for-triggered-workflow) using outputs
from the duplicate canceling for *source workflow* run above.

Hopefully we will have an easier way of doing that in the future once GitHub Actions API will allow
searching for source runs (it's not available at this moment).

### Cancel duplicate jobs for triggered workflow

Cancels all past runs from the *triggered workflow* if any of the job names match any of the regular
expressions. Note that it does not take into account the branch of the runs. It will cancel all runs
with matching job names no mater the branch/repo.

This example is much more complex. It shows the actual case on how you can design your jobs using with
using outputs from the cancel duplicate action and running subsequent cancel with namedJobs cancel
mode. Hopefully in the future better solution will come from Github Actions and such cancel flow will
be natively supported by GitHub Actions but as of now (August 2020) such native support is not
possible. The example below uses specially named jobs that contain Branch, Repo and Run id of
the triggering run. The cancel operation finds the runs that have jobs with the names following
pattern containing the same repo and branch as the source run branch and repo in order to cancel duplicates.

In the case below, this workflow will first cancel the "CI" duplicate runs from the same branch and then
it will cancel the runs from the Cancelling workflow which contain the same repo and branch as
in job names, effectively implementing cancelling duplicate runs for the Cancelling workflow.


```yaml
name: Cancelling
on:
  workflow_run:
    workflows: ['CI']
    types: ['requested']

jobs:
  cancel-duplicate-ci-runs:
    name: "Cancel duplicate CI runs"
    runs-on: ubuntu-latest
    outputs:
      sourceHeadRepo: ${{ steps.cancel.outputs.sourceHeadRepo }}
      sourceHeadBranch: ${{ steps.cancel.outputs.sourceHeadBranch }}
      sourceHeadSha: ${{ steps.cancel.outputs.sourceHeadSha }}
      sourceEvent: ${{ steps.cancel.outputs.sourceEvent }}
    steps:
      - uses: potiuk/cancel-workflow-runs@master
        id: cancel
        name: "Cancel duplicate CI runs"
        with:
          cancelMode: duplicates
          cancelFutureDuplicates: true
          token: ${{ secrets.GITHUB_TOKEN }}
          notifyPRCancel: true
          notifyPRMessageStart: |
            Note! The Docker Images for the build are prepared in a separate workflow,
            that you will not see in the list of checks.

            You can checks the status of those images in:
      - uses: potiuk/cancel-workflow-runs@master
        name: "Cancel duplicate Cancelling runs"
        with:
          cancelMode: namedJobs
          token: ${{ secrets.GITHUB_TOKEN }}
          notifyPRCancel: true
          jobNameRegexps: >
            ["Build info
            repo: ${{ steps.cancel.outputs.sourceHeadRepo }}
            branch: ${{ steps.cancel.outputs.sourceHeadBranch }}.*"]

  build-info:
    name: >
      Build info
      repo: ${{ needs.cancel-workflow-runs.outputs.sourceHeadRepo }}
      branch: ${{ needs.cancel-workflow-runs.outputs.sourceHeadBranch }}
    runs-on: ubuntu-latest
    needs: [cancel-duplicate-ci-runs]
    env:
      GITHUB_CONTEXT: ${{ toJson(github) }}
    steps:
      - name: >
          [${{ needs.cancel-workflow-runs.outputs.sourceEvent }}] will checkout
          Run id: ${{ github.run_id }}
          Source Run id: ${{ github.event.workflow_run.id }}
          Sha: ${{ needs.cancel-workflow-runs.outputs.sourceHeadSha }}
          Repo: ${{ needs.cancel-workflow-runs.outputs.sourceHeadRepo }}
          Branch: ${{ needs.cancel-workflow-runs.outputs.sourceHeadBranch }}
        run: |
          printenv
```


### Cancel the "self" source workflow run

This is useful in case you decide to cancel the *source run* that triggered the *triggered run*.
In the case below, the step cancels the `CI` workflow that triggered the `Cancelling` run.

```yaml
name: Cancelling
on:
  workflow_run:
    workflows: ['CI']
    types: ['requested']

  cancel-self-source-workflow-run:
    name: "Cancel the self CI workflow run"
    runs-on: ubuntu-latest
    steps:
      - name: "Cancel the self CI workflow run"
        uses: potiuk/cancel-workflow-runs@master
        with:
          cancelMode: self
          notifyPRCancel: true
          notifyPRCancelMessage: Cancelled because image building failed.
          token: ${{ secrets.GITHUB_TOKEN }}
          sourceRunId: ${{ github.event.workflow_run.id }}
```


### Cancel the "self" triggered workflow run

This is useful in case you decide to cancel the *triggered run*. The difference vs. previous case is that
you do not specify the `sourceRunId` input.

In the case below - self workflow will be cancelled.

```yaml
name: Cancelling
on:
  workflow_run:
    workflows: ['CI']
    types: ['requested']

  cancel-self-cancelling-run:
    name: "Cancel the self Canceling workflow run"
    runs-on: ubuntu-latest
    steps:
      - name: "Cancel the self Cancelling workflow run"
        uses: potiuk/cancel-workflow-runs@master
        with:
          cancelMode: self
          notifyPRCancel: true
          token: ${{ secrets.GITHUB_TOKEN }}

```

Note that if you want to cancel both - source workflow and self workflow you need to first cancel
the source workflow, and then cancel the self one, not the other way round :).

### Fail-fast source workflow runs with failed jobs

Cancels all runs from the *source workflow* if there are failed jobs matching any of the regular expressions.
Note that the action does not take into account the branch/repos of the runs. It will cancel all runs
with failed jobs no mater the branch/repo.

In the case below, if any of `CI` workflow runs (even with different branch heads) have failed jobs
names matching `^Static checks$` and `^Build docs^` or `^Build prod image .*` regexp - they
will be cancelled.

```yaml
name: Cancelling
on:
  workflow_run:
    workflows: ['CI']
    types: ['requested']

jobs:
  fail-fast-triggered-workflow-named-jobs-runs:
    name: "Fail fast CI runs"
    runs-on: ubuntu-latest
    steps:
      - uses: potiuk/cancel-workflow-runs@master
        name: "Fail fast CI runs"
        with:
          cancelMode: failedJobs
          token: ${{ secrets.GITHUB_TOKEN }}
          sourceRunId: ${{ github.event.workflow_run.id }}
          notifyPRCancel: true
          jobNameRegexps: '["^Static checks$", "^Build docs$", "^Build prod image.*"]'
```

Note that if you not only want to cancel the failed triggering workflows but also
the want to fail the corresponding "Cancelling" workflows, you need to implement the solution
described in the next chapter.

### Fail-fast source workflow runs with failed jobs and corresponding triggered runs

Cancels all runs from the *source workflow* if there are failed jobs matching any of the regular expressions,
also cancels the corresponding *triggered runs*.
Note that the action does not take into account the branch/repos of the runs. It will cancel all runs
with failed jobs no mater the branch/repo.

In the case below, if any of `CI` workflow runs (even with different branch heads) have failed jobs
names matching `^Static checks$` and `^Build docs^` or `^Build prod image .*` regexp - they
will be cancelled as well as the corresponding "Cancelling" workflow runs.

There is no native support yet in GitHub actions to do it easily, so the example below shows how this can be
achieved using `namedJobs` and output returned from the previous `Cancel Workflow Runs` action. Hopefull
this will be simplified when GitHub Actions introduce native support for it.

```yaml
name: Cancelling
on:
  workflow_run:
    workflows: ['CI']
    types: ['requested']

jobs:
  fail-fast-triggered-workflow-named-jobs-runs:
    name: "Fail fast CI runs"
    runs-on: ubuntu-latest
    steps:
      - uses: potiuk/cancel-workflow-runs@master
        name: "Fail fast CI. Source run: ${{ github.event.workflow_run.id }}"
        id: cancel-failed
        with:
          cancelMode: failedJobs
          token: ${{ secrets.GITHUB_TOKEN }}
          sourceRunId: ${{ github.event.workflow_run.id }}
          notifyPRCancel: true
          jobNameRegexps: '["^Static checks$", "^Build docs$", "^Build prod image.*"]'
      - name: "Extract canceled failed runs"
        id: extract-cancelled-failed-runs
        if: steps.cancel-failed.outputs.cancelledRuns != '[]'
        run: |
            REGEXP="Fail fast CI. Source run: "
            SEPARATOR=""
            for run_id in $(echo "${{ steps.cancel-failed.outputs.cancelledRuns }}" | jq '.[]')
            do
                REGEXP="${REGEXP}${SEPARATOR}(${run_id})"
                SEPARATOR="|"
            done
            echo "::set-output name=matching-regexp::${REGEXP}"
      - name: "Cancel triggered 'Cancelling' runs for the cancelled failed runs"
        if: steps.cancel-failed.outputs.cancelledRuns != '[]'
        uses: potiuk/cancel-workflow-runs@master
        with:
          cancelMode: namedJobs
          token: ${{ secrets.GITHUB_TOKEN }}
          notifyPRCancel: true
          jobNameRegexps: ${{ steps.extract-cancelled-failed.runs.matching-regexp }}

```

Note that if you not only want to cancel the failed triggering workflows but also
the want to fail the corresponding "Cancelling" workflows, you need to implement the solution
described in the next chapter.

### Fail-fast for triggered workflow runs with failed jobs

Cancels all runs from the *triggered workflow* if there are failed jobs matching any of the regular
expressions. Note that it does not take into account the branch/repos of the runs. It will cancel all runs
with failed jobs no mater the branch/repo.

In the case below, if any of `Cancelling` workflow runs (even with different branch heads) have failed jobs
names matching `^Static checks$` and `^Build docs^` or `^Build prod image .*` regexp - they
will be cancelled.

```yaml
name: Cancelling
on:
  workflow_run:
    workflows: ['CI']
    types: ['requested']

jobs:
  fail-fast-triggered-workflow-named-jobs-runs:
    name: "Fail fast Canceling runs"
    runs-on: ubuntu-latest
    steps:
      - uses: potiuk/cancel-workflow-runs@master
        name: "Fail fast Canceling runs"
        with:
          cancelMode: failedJobs
          token: ${{ secrets.GITHUB_TOKEN }}
          jobNameRegexps: '["^Static checks$", "^Build docs$", "^Build prod image.*"]'
```

### Cancel another workflow run

This is useful in case you decide to cancel the *source run* that triggered the *triggered run*.
In the case below, the step cancels the `CI` workflow that triggered the `Cancelling` run.

```yaml
name: Cancelling
on:
  workflow_run:
    workflows: ['CI']
    types: ['requested']

  cancel-other-workflow-run:
    name: "Cancel the self CI workflow run"
    runs-on: ubuntu-latest
    steps:
      - name: "Cancel the self CI workflow run"
        uses: potiuk/cancel-workflow-runs@master
        with:
          cancelMode: duplicates
          cancelFutureDuplicates: true
          token: ${{ secrets.GITHUB_TOKEN }}
          workflowFileName: other_workflow.yml
```

### Cancel all duplicates for named jobs

Cancels all duplicated runs for all jobs that match specified regular expression.
Note that it does not take into account the branch of the runs. It will cancel all duplicates with
the same match for jobs, no matter what branch originated it.

This is useful in case of job names generated dynamically.

In the case below, for all the runs that have job names generated containing Branch/Repo/Event combination
that have the same match, the duplicates will get cancelled leaving only the most recent run for each exact
match.

Note that the match must be identical. If there are two jobs that have a different Branch
they will both match the same pattern, but they are not considered duplicates.

Also, this is one of the jobs It has also self-preservation turned off.
This means that in case the job determines that it is itself a duplicate it will cancel itself. That's
why checking for duplicates of self-workflow should be the last step in the cancelling process.


```yaml
on:
  push:
  workflow_run:
    workflows: ['CI']
    types: ['requested']

jobs:
  cancel-self-failed-runs:
    name: "Cancel the self workflow run"
    runs-on: ubuntu-latest
    steps:
      - uses: potiuk/cancel-workflow-runs@master
        name: "Cancel past CI runs"
        with:
          cancelMode: allDuplicatedNamedJobs
          token: ${{ secrets.GITHUB_TOKEN }}
          jobNameRegexps: '["Branch: .* Repo: .* Event: .* "]'
          selfPreservation: false
          notifyPRCancel: true

```



## Repositories that do not use Pull Requests from forks

Note that examples in this chapter only work if you do not have Pull Requests coming from forks (so for
example if you only work in a private repository). When those action runs within the usual `pull_request`
triggered runs coming from a fork, they have not enough permissions to cancel running workflows.

If you want to cancel `pull_requests` from forks, you need to use `workflow_run` triggered runs - see the
[Repositories that use Pull Requests from fork](#repositories-that-use-pull-requests-from-forks) chapter.

Note that in case you configure the separate `workflow_run` Cancelling workflow, there is no need to add
the action to the "source" workflows. The "Canceling workflow" pattern handles well not only Pull Requests
from the forks, but also all other cases - including cancelling Pull Requests for the same repository
and canceling scheduled runs.

### Cancel duplicate runs for "self" workflow

Cancels past runs for the same workflow (with the same branch).

In the case below, any of the direct "push" events will cancel all past runs for the same branch as the
one being pushed. However, it can be configured for "pull_request" (in the same repository) or "schedule"
type of events as well. It will also notify the PR with the comment containining why it has been
cancelled.

```yaml
name: CI
on: push
jobs:
  cancel-duplicate-workflow-runs:
    name: "Cancel duplicate workflow runs"
    runs-on: ubuntu-latest
    steps:
      - uses: potiuk/cancel-workflow-runs@master
        name: "Cancel duplicate workflow runs"
        with:
          cancelMode: duplicates
          cancelFutureDuplicates: true
          notifyPRCancel: true
```

### Cancel "self" workflow run

This is useful in case you decide to cancel "self" run.

In the case below - own workflow will be cancelled immediately. It can be configured for "push",
"pull_request" (from the same repository) or "schedule" type of events.

```yaml
name: CI
on: push
jobs:
  cancel-self-run:
    name: "Cancel the self workflow run"
    runs-on: ubuntu-latest
    steps:
      - name: "Cancel the self workflow run"
        uses: potiuk/cancel-workflow-runs@master
        with:
          cancelMode: self
          token: ${{ secrets.GITHUB_TOKEN }}
          notifyPRCancel: true
```

### Fail-fast workflow runs with failed jobs

Cancels all runs (including self run!) if they have failed jobs matching any of the regular expressions.
Note that it does not take into account the branch of the running jobs. It will cancel all runs with failed
jobs, no matter what branch originated it.

In the case below, if any of the own workflow runs have failed jobs matching any of the
`^Static checks$` and `^Build docs^` or `^Build prod image .*` regexp, this workflow will cancel the runs.

```yaml
name: CI
on:
  push:

jobs:
  cancel-self-failed-runs:
    name: "Cancel failed runs"
    runs-on: ubuntu-latest
    steps:
      - uses: potiuk/cancel-workflow-runs@master
        name: "Cancel failed runs"
        with:
          cancelMode: failedJobs
          token: ${{ secrets.GITHUB_TOKEN }}
          jobNameRegexps: '["^Static checks$", "^Build docs$", "^Build prod image.*"]'
          notifyPRCancel: true
```

### Cancel all runs with named jobs

Cancels all runs (including self run!) if any of the job names match any of the regular
expressions. Note that it does not take into account the branch of the runs. It will cancel all runs with
matching jobs, no matter what branch originated it.

This is useful in case of job names generated dynamically.

In the case below, if any of the "self" workflow runs has job names that matches any of the
`^Static checks$` and `^Build docs^` or `^Build prod image .*` regexp, this workflow will cancel the runs.

```yaml
on:
  push:
  workflow_run:
    workflows: ['CI']
    types: ['requested']

jobs:
  cancel-self-failed-runs:
    name: "Cancel the self workflow run"
    runs-on: ubuntu-latest
    steps:
      - uses: potiuk/cancel-workflow-runs@master
        name: "Cancel past CI runs"
        with:
          cancelMode: namedJobs
          token: ${{ secrets.GITHUB_TOKEN }}
          jobNameRegexps: '["^Static checks$", "^Build docs$", "^Build prod image.*"]'
          notifyPRCancel: true
```

## Tackling the high queue strain situation

Sometimes your project is in a situation where you have high strain on the queue in GitHub Actions.
All GitHub Actions queues are limited and when you have many, long-running workflows triggered by
many PRs, you can get in the situation, where the "cancel" workflows are queued themselves. This is where
`allDuplicates` mode of cancellation becomes handy,


Imagine, You have a number of people submitting `PR1`, `PR2` from their forks, and a committer pushing branch
`branch-A` directly to your repository.  Imagine that some of those people pushed several commits in
quick succession  for all of those.

This usually happen when you realized that there is one more change needed or when you
iteratively work on your PR. Usually it is either a `--force-push` commit replacing the previous ones
or "--fixup commit". It works the same in both cases but this is a "natural" way people work.
For example for many people it is far easier to review whole extent of your change in GitHub
(they are used to doing PR reviews there). They push the change as PR, review it there themselves
and realize they need one more line to be removed (and they add --fixup and push again).

Coming back to my example. Imagine you have high strain situation. All your PRs generated 10 or so
workflows (that's how Pulsar works - produces many workflows per PR). But let's assume we have two
"real" workflows "w1" and "w2" and the "cancel" workflow I added "c". So, initially all of the workflows
generated are in "Pending" state. assume each of the PRs has been pushed twice -
first `Commit 1` (C1) and then fixup `Commit 2` (C2). So all C1s are "older" duplicates of C2 that
should be cancelled as soon as possible (we know newer version is coming).

|          | w1-C1   | w2-C1   | c-C1    | w1-C2   | w2-C2   | c-C2    |
|----------|---------|---------|---------|---------|---------|---------|
| PR1      | pending | pending | pending | pending | pending | pending |
| PR2      | pending | pending | pending | pending | pending | pending |
| branch-A | pending | pending | pending | pending | pending | pending |

Then imagine that PR1 "standard" worflows started to run for C1. So they change state to 'running'

|          | w1-C1   | w2-C1   | c-C1    | w1-C2   | w2-C2   | c-C2    |
|----------|---------|---------|---------|---------|---------|---------|
| PR1      | running | running | pending | pending | pending | pending |
| PR2      | pending | pending | pending | pending | pending | pending |
| branch-A | pending | pending | pending | pending | pending | pending |

So far so good. Then the "cancel workflow"  starts running for C1 commit in PR1.

|          | w1-C1   | w2-C1   | c-C1    | w1-C2   | w2-C2   | c-C2    |
|----------|---------|---------|---------|---------|---------|---------|
| PR1      | running | running | running | pending | pending | pending |
| PR2      | pending | pending | pending | pending | pending | pending |
| branch-A | pending | pending | pending | pending | pending | pending |

The "cancel" workflow with `allDuplicates` mode is "aggressive". It will look for ANY duplicates in
ANY PRs/Branches (including the Pending ones) and cancels them. So what happens next it will set all
C1 runs to cancelled state (no matter if they were Pending or running):


|          | w1-C1   | w2-C1   | c-C1    | w1-C2   | w2-C2   | c-C2    |
|----------|---------|---------|---------|---------|---------|---------|
| PR1      | cancelling | cancelling | complete | pending | pending | pending |
| PR2      | cancelling | cancelling | pending | pending | pending | pending |
| branch-A | cancelling | cancelling | pending | pending | pending | pending |

Those runs will be quickly canceled and job slots from the "Running" ones will be freed for next runs so
likely, some of the Pending C2 runs from PR1 will be quickly "Running:

|          | c-C1     | w1-C2   | w2-C2   | c-C2    |
|----------|----------|---------|---------|---------|
| PR1      | complete | running | running | pending |
| PR2      | pending  | pending | pending | pending |
| branch-A | pending  | pending | pending | pending |

Now - the "cancel" workflows are not cancelled themselves. They will continue running, but they are
quick usually and any "cancel workflow" run next will see there are no duplicates and will complete
quickly leaving the "slot" for "real" workflows of the latest commits (C2) to run - hopefully more
slots are available then, and your C2 workflows start running after that:

|          | c-C1     | w1-C2    | w2-C2    | c-C2     |
|----------|----------|----------|----------|----------|
| PR1      | complete | complete | complete | complete |
| PR2      | complete | running  | running  | pending  |
| branch-A | pending  | pending  | pending  | pending  |

Hower if the committer again pushes THIRD commit C3 to branch-A in the meantime, the (so far pending)
cancel workflows will again prove to be useful. Let's say PR2's "cancel workflow" for C2 runs after
the new commit has been added by the commiyter:

|          | c-C1     | w1-C2    | w2-C2    | c-C2     | w1-C3   | w2-C3   | c-C3    |
|----------|----------|----------|----------|----------|---------|---------|---------|
| PR1      | complete | complete | complete | complete |         |         |         |
| PR2      | complete | complete | running  | running  |         |         |         |
| branch-A | pending  | pending  | pending  | pending  | pending | pending | pending |

The PR2's c-C2 workflow (or even branch-As, c-C1 workflow if the PR2's one managed to run already)
will find that there is a duplicate in `branch-A` and it will cancel those:

|          | c-C1     | w1-C2    | w2-C2    | c-C2     | w1-C3   | w2-C3   | c-C3    |
|----------|----------|----------|----------|----------|---------|---------|---------|
| PR1      | complete | complete | complete | complete |         |         |         |
| PR2      | complete | complete | complete  | complete  |         |         |         |
| branch-A | complete  | cancelled  | cancelled  | running  | running | running | pending |

Again the remaining "cancel" workflow (branch A's c-C2 an c-C3) complete quickly and do nothing as
there are no duplicates, freeing the slot for "regular" workflows:

|          | c-C1     | w1-C2    | w2-C2    | c-C2     | w1-C3   | w2-C3   | c-C3    |
|----------|----------|----------|----------|----------|---------|---------|---------|
| PR1      | complete | complete | complete | complete |         |         |         |
| PR2      | complete | complete | complete  | complete  |         |         |         |
| branch-A | complete  | cancelled  | cancelled  | complete  | running | running | complete |

Effectively what we get is that the "duplicates" will be cancelled frequently enough (as often as
ANY "cancel" workflow from  ANY commit from ANY branch manages to get into "running" state)


## Development environment

It is highly recommended tu use [pre commit](https://pre-commit.com). The pre-commits
installed via pre-commit tool handle automatically linting (including automated fixes) as well
as building and packaging Javascript index.js from the main.ts Typescript code, so you do not have
to run it yourself.

## License
[MIT License](LICENSE) covers the scripts and documentation in this project.
