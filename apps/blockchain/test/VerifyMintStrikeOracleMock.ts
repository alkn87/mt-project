export class VerifyMintStrikeOracleMock {
  constructor() {
    // TODO placeholder
  }

  static verify(mintStrike: number, changeSetId: number, mapUserName: string) {
    // This method mocks a real oracle implementation which would parse OSM data
    // and verify if given user set the mint strike with on the claimed change set.
    // For development and testing only, changeSetId between 0 and 500 is considered correct,
    // all others considered incorrect claims.
    return changeSetId >= 0 && changeSetId <= 500;
  }
}
