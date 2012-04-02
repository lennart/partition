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
  });

  // All of the following test should maintain the same behaviour as Paperclip's
  // :id_partition interpolation as seen on:
  // https://github.com/thoughtbot/paperclip/blob/v2.7.0/lib/paperclip/interpolations.rb#L152
  //
  // The following specs are used in Paperclip itself
  //
  // should "return the partitioned id of the attachment when the id is an integer" do
  //   attachment = mock
  //   attachment.expects(:id).returns(23)
  //   attachment.expects(:instance).returns(attachment)
  //   assert_equal "000/000/023", Paperclip::Interpolations.id_partition(attachment, :style)
  // end

  // should "return the partitioned id of the attachment when the id is a string" do
  //   attachment = mock
  //   attachment.expects(:id).returns("32fnj23oio2f")
  //   attachment.expects(:instance).returns(attachment)
  //   assert_equal "32f/nj2/3oi", Paperclip::Interpolations.id_partition(attachment, :style)
  // end

  // should "return nil for the partitioned id of an attachment to a new record (when the id is nil)" do
  //   attachment = mock
  //   attachment.expects(:id).returns(nil)
  //   attachment.expects(:instance).returns(attachment)
  //   assert_nil Paperclip::Interpolations.id_partition(attachment, :style)
  // end

  describe(".scheme()", function(){
    var partition,
        root = path.join(__dirname, "tmp");

    beforeEach(function(){

      partition = new Partition({root: root});
    });

    it("should return the partitioned id of the attachment when the id is an integer", function(){
      expect(partition.scheme(23)).to.be("000/000/023");
    });

    it("should return the partitioned id of the attachment when the id is a string", function() {
      expect(partition.scheme('32fnj23oio2f')).to.be("32f/nj2/3oi");
    });

    it("should return null for the partitioned id when the id is null", function() {
      expect(partition.scheme(null)).to.be(null);
    });


  });
});