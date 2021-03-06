/*!
 * Lunr - Document
 * Copyright (C) 2011 Oliver Nightingale
 * MIT Licensed
 */

Lunr.Document = (function () {

  /**
   * Lunr.Document wraps any document that is added to the index.  It extracts any words from the document
   * fields that need indexing and formats the document in a way ready for insertion into the Lunr.Index
   * docStore.
   *
   * @constructor
   * @param {Object} original - the document to be added to the search index.
   * @param {String} refName - the name of the property that can be used as a reference to this document in the index.
   * @param {Object} fields - the fields object from the index, indicationg which fields from the document need indexing.
   *
   */
  var Document = function (original, refName, fields) {
    this.original = original
    this.fields = fields
    this.ref = original[refName]
  }

  /**
   * Returns a json representation of the document.
   *
   * Converts this instance of Lunr.Document into a plain object ready for insertion into the index.
   * The returned object consists of three properties, an id, an array of Lunr.Word ids and the
   * original document.
   *
   * @returns {Object} the plain object representation of the Lunr.Document.
   */
  Document.prototype.asJSON = function () {
    return {
      id: this.ref,
      words: Lunr.utils.map(this.words(), function (word) { return word.id }),
      original: this.original
    }
  }

  /**
   * Retrurns a list of words within the document.
   *
   * For each field in the original document that requires indexing this method will create an instance of
   * Lunr.Word and then tally the total score for that word in the document as a whole.  At this time any
   * multiplier specified in the fields object will be applied.
   *
   * The list of words will then be converted into a format ready for insertion into the index.
   *
   * @see Lunr.Word
   * @returns {Array} an array of all word objects ready for insertion into the index's wordStore.
   */
  Document.prototype.words = function () {
    var words = {}
    var self = this
    var allWords = {}

    Lunr.utils.forEachKey(this.fields, function (fieldName) {
      var wordObjs = Lunr.Word.fromString(self.original[fieldName]),
          numberOfWords = wordObjs.length

      for (var i=0; i < numberOfWords; i++) {
        var word = wordObjs[i].toString()

        if (!(word in allWords)) {
          allWords[word] = { score: 0, ref: self.ref }
        };

        allWords[word].score = allWords[word].score + self.fields[fieldName].multiplier
      };
    })

    return Lunr.utils.mapKeys(allWords, function (word) {
      return {id: word, doc: {score: allWords[word].score, documentId: self.ref} }
    })
  }

  return Document
})()
