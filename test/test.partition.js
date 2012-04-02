describe("Partition", function(){
  var Partition = require('../');

  describe("new Partition()", function(){
    
    it("should return a `Partition`", function(){
      expect(new Partition()).to.be.a(Partition);
    });

    it("should pass through root folder", function(){
      var root = "/tmp",
          partition = new Partition({
            root: root
          });

      expect(partition).to.have.property("root", root);
    });

    it("should resolve relative root folder to `pwd`", function(){
      var root = "./tmp",
          resolvedRoot = path.join(__dirname, "..", "tmp"),
          partition = new Partition({
            root: root
          });

      expect(partition).to.have.property("root", resolvedRoot);
    });
  });

  describe("instance methods", function(){
    var partition,
        root = "tmp",
        resolvedRoot = path.resolve(process.cwd(), root);

    /** 
     *
     * All of the following test should maintain the same behaviour as Paperclip's
     * :id_partition interpolation as seen on:
     * https://github.com/thoughtbot/paperclip/blob/v2.7.0/lib/paperclip/interpolations.rb#L152
     *
     * The following specs are used in Paperclip itself
     *
     * should "return the partitioned id of the attachment when the id is an integer" do
     *   attachment = mock
     *   attachment.expects(:id).returns(23)
     *   attachment.expects(:instance).returns(attachment)
     *   assert_equal "000/000/023", Paperclip::Interpolations.id_partition(attachment, :style)
     * end

     * should "return the partitioned id of the attachment when the id is a string" do
     *   attachment = mock
     *   attachment.expects(:id).returns("32fnj23oio2f")
     *   attachment.expects(:instance).returns(attachment)
     *   assert_equal "32f/nj2/3oi", Paperclip::Interpolations.id_partition(attachment, :style)
     * end

     * should "return nil for the partitioned id of an attachment to a new record (when the id is nil)" do
     *   attachment = mock
     *   attachment.expects(:id).returns(nil)
     *   attachment.expects(:instance).returns(attachment)
     *   assert_nil Paperclip::Interpolations.id_partition(attachment, :style)
     * end
     */ 
    describe(".scheme()", function(){

      beforeEach(function(){
        partition = new Partition({root: root});
      });

      it("should return the partitioned id of the attachment when the id is an integer", function(){
        expect(partition.scheme(23)).to.be("000/000/023");
      });

      it("should return the partitioned id of the attachment when the id is a string", function() {
        expect(partition.scheme('32fnj23oio2f')).to.be("32f/nj2/3oi");
      });

      it("should return the partitioned id of the attachment when the id is a short string", function() {
        expect(partition.scheme('231249')).to.be("000/231/249");
      });

      it("should return null for the partitioned id when the id is null", function() {
        expect(partition.scheme(null)).to.be(null);
      });
    });

    describe(".resolve()", function(){
      beforeEach(function(){
        partition = new Partition({root: root});
      });

      describe(".resolve(23)", function(){
        it("should return absolute path", function(){
          expect(partition.resolve(23)).to.be(path.join(partition.root, '23'));
        });
      });

      describe(".resolve('000/000/023')", function(){
        it("should return absolute path", function(){
          expect(partition.resolve("000/000/023")).to.be(path.join(partition.root, "000", "000", "023"));
        });
      });

      describe(".resolve('32fnj23oio2f')", function(){
        it("should return absolute path", function(){
          expect(partition.resolve("32fnj23oio2f")).to.be(path.join(partition.root, "32fnj23oio2f"));
        });
      });

      describe(".resolve(null)", function(){
        it("should return root path", function(){
          expect(partition.resolve(null)).to.be(resolvedRoot);
        });
      });
    });

    describe(".prepare()", function(){

      describe(".prepare(partition.scheme(23))", function(){
        var target;

        beforeEach(function(){
          sh.rm("-Rf", resolvedRoot);
          sh.mkdir("-p", resolvedRoot);
          partition = new Partition({root: root});
          target = partition.resolve(partition.scheme(23));
        });

        it("should call back without error", function(done) {
          partition.prepare(target, done);
        });

        it("should create parent folder for scheme", function(done) {
          partition.prepare(target, function(err) {
            if(path.existsSync(target)) {
              done();
            }
            else {
              done(new Error("missing target folder " + target));
            }
          });
        });
      });
    });

    
    describe(".link()", function(){

      beforeEach(function(){
        sh.rm("-Rf", resolvedRoot);
        sh.mkdir("-p", resolvedRoot);
        partition = new Partition({root: root});
      });

      describe("without src folder", function() {
        it("should call back with error", function(done){
          partition.link(23, function(err) {
            if(err == "missing source folder '"+ partition.resolve(23) + "'") {
              done();
            }
            else {
              done(new Error("expected failure, got: '" + err + "'"));
            }
          });
        });
      });

    
      describe(".link(23, cb)", function(){
        beforeEach(function(){
          sh.mkdir("-p", partition.resolve(23));
        });

        describe("with existing target", function(){
          beforeEach(function(){
            sh.mkdir("-p", partition.resolve(partition.scheme(23)));
          });

          it("should call back with error", function(done){
            partition.link(23, function(err) {
              if(err.code == "EEXIST") {
                done();
              }
              else {
                done(new Error("expected failure, got: '" + err + "'"));
              }
            });
          });
        });

        it("should call back without error", function(done){
          partition.link(23, function(err) {
            done(err);
          }); 
        });

        it("should link to partitioned target", function(done){
          var destination = partition.resolve(partition.scheme(23));
          partition.link(23, function(err) {
            if(path.existsSync(destination)) {
              done();
            }
            else {
              done(new Error("missing linked file" + destination));
            }
          });
        });

        it("should keep original source", function(done) {
          var source = partition.resolve(23);

          partition.link(23, function(err) {
            if(path.existsSync(source)) {
              done();
            }
            else {
              done(new Error("DANGER: linking removed source path: '" + source + ";"));
            }
          });
        });

        describe("with subfolders", function(){
          var subfolder, target, file, targetFile;

          beforeEach(function(done){
            subfolder = partition.resolve("23/snafu");
            target = partition.resolve(path.join(partition.scheme(23), "snafu"));
            file = partition.resolve("23/snafu/fnord.txt");
            targetFile = partition.resolve(path.join(partition.scheme(23), "snafu", "fnord.txt"));

            sh.mkdir("-p", subfolder);
            touch.sync(file);

            partition.link(23, function(err) {
              done(err);
            });
          });

          it("should have linked subfolder as well", function(){
            expect(path.existsSync(target)).to.be(true);
          });

          it("should have linked the file as well", function() {
            expect(path.existsSync(targetFile)).to.be(true);
          });

          describe("after deletion of original source folder", function(){

            beforeEach(function(){
              sh.rm("-Rf", partition.resolve(23));
            });

            it("should retain subfolders in linked folder", function(){
              expect(path.existsSync(target)).to.be(true);
            });

            it("should retain file in subfolder", function(){
              expect(path.existsSync(targetFile)).to.be(true);
            });
          });

        });
      });
    });
  });
});