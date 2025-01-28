# Update nixpkgs with:
# nix-shell -p niv --run "niv update"

let
  sources = import ./nix/sources.nix;
  pkgs = import sources.nixpkgs {};
  build_daml = import ./nix/daml.nix;
  damlYaml = builtins.fromJSON (builtins.readFile (pkgs.runCommand "daml.yaml.json" { yamlFile = ./multi-package.yaml; } ''
                ${pkgs.yj}/bin/yj < "$yamlFile" > $out
              ''));
  daml = (build_daml { stdenv = pkgs.stdenv;
                       jdk = pkgs.openjdk11_headless;
                       sdkVersion = damlYaml.sdk-version;
                       damlVersion = damlYaml.daml-version;
                       tarPath = damlYaml.daml-tar-path or null;
                       curl = pkgs.curl;
                       curl_cert = "${pkgs.cacert}/etc/ssl/certs/ca-bundle.crt";
                       os = if pkgs.stdenv.isDarwin then "macos" else "linux";
                       osJFrog = if pkgs.stdenv.isDarwin then "macos" else "linux-intel";
                       hashes = { linux = "SM26LFj43g4TFba1EpLFazaEdvDFOufvMPrbGPYYP0o=";
                                  macos = "wdXq5PVge6pyf3FuW+winRhMM7707Lg0b4cr4L8+nE4="; };});            
in
pkgs.mkShell {
  SSL_CERT_FILE = "${pkgs.cacert}/etc/ssl/certs/ca-bundle.crt";
  buildInputs = with pkgs; [
    daml
    bash
    binutils
    cacert
    circleci-cli
    curl
    gh
    git
    gnupg
    jq
    nodejs
    python39
    yq-go
  ];
}
