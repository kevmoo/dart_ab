library hop_runner;

import 'package:hop/hop.dart';
import 'package:hop/hop_tasks.dart';

void main(List<String> args) {

  addTask('pages', (ctx) =>
      branchForDir(ctx, 'master', 'build/web', 'gh-pages'));

  runHop(args);
}

