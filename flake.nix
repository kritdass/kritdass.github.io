{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let pkgs = import nixpkgs { inherit system; }; in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [ bun nodejs ];
        };

        packages.default = pkgs.stdenv.mkDerivation {
          name = "kritdass.github.io";
          src = ./.;
          nativeBuildInputs = [ pkgs.bun ];

          buildPhase = ''
            export HOME=$(mktemp -d)
            bun install --frozen-lockfile
            bun run build
          '';

          installPhase = "cp -r dist $out";
        };
      }
    );
}
