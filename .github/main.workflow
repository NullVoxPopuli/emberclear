workflow "Quality and Correctness" {
  on = "push"
  resolves = ["Lint JS/TS", "Lint Templates", "Lint Styles", "Unit Tests", "Helper Tests", "Integration Tests", "Acceptance Tests"]
}

action "Lint JS/TS" {
  uses = "actions/npm@6309cd9"
  runs = "lint:js"
}

action "Lint Templates" {
  uses = "actions/npm@6309cd9"
  runs = "lint:hbs"
}

action "Lint Styles" {
  uses = "actions/npm@6309cd9"
  runs = "lint:sass"
}

action "Check Types" {
  uses = "actions/npm@6309cd9"
  runs = "tsc"
}

action "Unit Tests" {
  uses = "actions/npm@6309cd9"
  needs = ["Check Types", "Lint JS/TS", "Lint Styles"]
  runs = "test:named"
  args = "Unit"
}

action "Helper Tests" {
  uses = "actions/npm@6309cd9"
  needs = ["Check Types"]
  runs = "test:named"
  args = "Helper"
}

action "Integration Tests" {
  uses = "actions/npm@6309cd9"
  needs = ["Check Types"]
  runs = "test:named"
  args = "Integration"
}

action "Acceptance Tests" {
  uses = "actions/npm@6309cd9"
  needs = ["Check Types"]
  runs = "test:named"
  args = "Acceptance"
}
