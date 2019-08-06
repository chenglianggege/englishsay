package com.tt.setting;


public class RecordSetting {
    private static final String TAG = "17kouyu";
    private boolean isNeedSoundIntensity;
    private String audioType = "wav";
    private int sampleRate = 16000;
    private int channel = 1;
    private String coreType;
    private String refText;
    private String refAudio;
    private boolean isNeedRequestParamsInResult;
    private boolean isNeedWordScoreInParagraph;
    private boolean isNeedAttachAudioUrlInResult = true;
    private String dict_type = "KK";
    private boolean isNeedPhonemeOutputInWord = true;
    private int scale = 100;
    private double precision = 1.0D;
    private double slack;
    private String keywords;
    private int qType;
    private int agegroup = 3;
    private String recordFilePath ="" ;
    private String recordName = "";
    private int phonemeDiagnosis = 0;

    public void setRecordName(String recordName) {
        this.recordName = recordName;
    }

    public String getRecordName() {
        return recordName;
    }

    public String getRecordFilePath() {
        return recordFilePath;
    }

    public void setRecordFilePath(String recordFilePath) {
        this.recordFilePath = recordFilePath;
    }

    public String toString() {
        return "RecordSetting{isNeedSoundIntensity=" + this.isNeedSoundIntensity + ", audioType='" + this.audioType + '\'' + ", sampleRate=" + this.sampleRate + ", channel=" + this.channel + ", coreType='" + this.coreType + '\'' + ", refText='" + this.refText + '\'' + ", refAudio='" + this.refAudio + '\'' + ", isNeedRequestParamsInResult=" + this.isNeedRequestParamsInResult + ", isNeedWordScoreInParagraph=" + this.isNeedWordScoreInParagraph + ", isNeedAttachAudioUrlInResult=" + this.isNeedAttachAudioUrlInResult + ", dict_type='" + this.dict_type + '\'' + ", isNeedPhonemeOutputInWord=" + this.isNeedPhonemeOutputInWord + ", scale=" + this.scale + ", precision=" + this.precision + ", slack=" + this.slack + ", keywords='" + this.keywords + '\'' + ", qType=" + this.qType + '}';
    }

    public RecordSetting(String coreType, String refText) {
        this.coreType = coreType;
        this.refText = refText;
    }

    public RecordSetting(String refText, int qType) {
        this.coreType = "open.eval";
        this.refText = refText;
        this.qType = qType;
    }

    public RecordSetting(String refAudio) {
        this.coreType = "align.eval";
        this.refAudio = refAudio;
    }

    public boolean isNeedSoundIntensity() {
        return this.isNeedSoundIntensity;
    }

    public RecordSetting setNeedSoundIntensity(boolean needSoundIntensity) {
        this.isNeedSoundIntensity = needSoundIntensity;
        return this;
    }

    public String getAudioType() {
        return this.audioType;
    }

    public RecordSetting setAudioType(String audioType) {
        this.audioType = audioType;
        return this;
    }

    public int getSampleRate() {
        return this.sampleRate;
    }

    public RecordSetting setSampleRate(int sampleRate) {
        this.sampleRate = sampleRate;
        return this;
    }

    public int getChannel() {
        return this.channel;
    }

    public RecordSetting setChannel(int channel) {
        this.channel = channel;
        return this;
    }

    public boolean isNeedRequestParamsInResult() {
        return this.isNeedRequestParamsInResult;
    }

    public RecordSetting setNeedRequestParamsInResult(boolean needRequestParamsInResult) {
        this.isNeedRequestParamsInResult = needRequestParamsInResult;
        return this;
    }

    public String getCoreType() {
        return this.coreType;
    }

    public String getRefText() {
        return this.refText;
    }

    public String getRefAudio() {
        return this.refAudio;
    }

    public boolean isNeedWordScoreInParagraph() {
        return this.isNeedWordScoreInParagraph;
    }

    public RecordSetting setNeedWordScoreInParagraph(boolean needWordScoreInParagraph) {
        this.isNeedWordScoreInParagraph = needWordScoreInParagraph;
        return this;
    }

    public boolean isNeedAttachAudioUrlInResult() {
        return this.isNeedAttachAudioUrlInResult;
    }

    public RecordSetting setNeedAttachAudioUrlInResult(boolean needAttachAudioUrlInResult) {
        this.isNeedAttachAudioUrlInResult = needAttachAudioUrlInResult;
        return this;
    }

    public String getDict_type() {
        return this.dict_type;
    }

    public RecordSetting setDict_type(String dict_type) {
        this.dict_type = dict_type;
        return this;
    }

    public boolean isNeedPhonemeOutputInWord() {
        return this.isNeedPhonemeOutputInWord;
    }

    public RecordSetting setNeedPhonemeOutputInWord(boolean needPhonemeOutputInWord) {
        this.isNeedPhonemeOutputInWord = needPhonemeOutputInWord;
        return this;
    }

    public int getScale() {
        return this.scale;
    }

    public RecordSetting setScale(int scale) {
        this.scale = scale;
        return this;
    }

    public double getPrecision() {
        return this.precision;
    }

    public RecordSetting setPrecision(double precision) {
        this.precision = precision;
        return this;
    }

    public double getSlack() {
        return this.slack;
    }

    public RecordSetting setSlack(double slack) {
        this.slack = slack;
        return this;
    }

    public String getKeywords() {
        return this.keywords;
    }

    public RecordSetting setKeywords(String keywords) {
        this.keywords = keywords;
        return this;
    }

    public int getqType() {
        return this.qType;
    }

    public int getAgegroup() {
        return this.agegroup;
    }

    public void setAgegroup(int agegroup) {
        this.agegroup = agegroup;
    }

    public void setPhonemeDiagnosis(int phonemeDiagnosis) {
        this.phonemeDiagnosis = phonemeDiagnosis;
    }

    public int getPhonemeDiagnosis() {
        return phonemeDiagnosis;
    }
}

