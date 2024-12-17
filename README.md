# Bl-model

A library containing the classes needed for the boklisten ecosystem.

## Requires

Typescript 4+

Read more about [typescript](www.typescriptlang.com)

## Installation

This module can easily be installed by running `yarn install`
`bash
yarn install @boklisten/bl-model

````

## Development

Publish with
```bash
npm version patch && yarn pub
```

## Usage

Every class can now be used by importing it into your project and classes.

Example usage:

```typescript
import { Branch, CustomerItem } from "@boklisten/bl-model";

class SampleClass {
  branch: Branch;
  customerItem: CustomerItem;

  public printBranchName() {
    console.log(this.branch.name);
  }
}
````
