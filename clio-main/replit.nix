
{ pkgs }: {
  deps = [
    pkgs.tk
    pkgs.tcl
    pkgs.qhull
    pkgs.pkg-config
    pkgs.gtk3
    pkgs.gobject-introspection
    pkgs.ghostscript
    pkgs.ffmpeg-full
    pkgs.cairo
    pkgs.glibcLocales
    pkgs.freetype
    pkgs.redis
    pkgs.python3Packages.redis
  ];
  env = {
    PYTHONPATH = "${pkgs.python3Packages.redis}/${pkgs.python3.sitePackages}";
  };
}
